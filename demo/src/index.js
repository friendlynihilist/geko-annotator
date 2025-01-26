import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import ReactDOMServer from "react-dom/server";
import mirador from "mirador/dist/es/src/index";
import annotationPlugins from "../../src";
import LocalStorageAdapter from "../../src/LocalStorageAdapter";
import { v4 as uuidv4 } from "uuid";
import jsonld from "jsonld";

// 3rd-party imports
import { Typography, Button, Box, Input } from "@material-ui/core";
import {
  Person,
  Place,
  Business,
  Event,
  Brush,
  GetApp,
  AccountTree,
  Brightness3,
  Brightness5,
} from "@material-ui/icons";

// ** Import your TextAnnotatorComponent **
import TextAnnotatorComponent from "../../src/TextAnnotatorComponent";

// Redux or Mirador actions (if used)
import { updateWorkspaceMosaicLayout } from "mirador/dist/es/src/state/actions";
import { getWorkspaceType } from "mirador/dist/es/src/state/selectors";

/** ----------------------------------
 *  CREATE ROOT IF NOT PRESENT
 *  ---------------------------------- */
if (!document.getElementById("root")) {
  const rootDiv = document.createElement("div");
  rootDiv.id = "root";
  document.body.appendChild(rootDiv);
}

/** ----------------------------------
 *  MIRADOR CONFIG
 *  ---------------------------------- */
const config = {
  annotation: {
    adapter: (canvasId) =>
      new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
    exportLocalStorageAnnotations: true,
  },
  id: "mirador",
  selectedTheme: "dark",
  window: {
    defaultSideBarPanel: "annotations",
    sideBarOpenByDefault: false,
    view: "single",
  },
  windows: [
    {
      loadedManifest:
        "https://manifest-editor.digirati.services/api/iiif/p3/68f6553ffd28a68b41c51b8fe7e55b6b/1737911405102",
    },
    // Uncomment and adapt if you want multiple manifests:
    // {
    //   loadedManifest:
    //     "https://manifest-editor.digirati.services/api/iiif/p3/8f122a3f41f81fbacdbf2d2db98ed29c/1737480078910",
    // },
  ],
  workspace: {
    type: "elastic", // Enables elastic workspace mode
  },
};

/** ----------------------------------
 *  NER HIGHLIGHTING LOGIC
 *  ---------------------------------- */
const labelIcons = {
  ARTISTA: { icon: <Person />, color: { start: "#FF7F50", end: "#FF4500" } },
  OPERA: { icon: <Brush />, color: { start: "#87CEFA", end: "#4682B4" } },
  ORGANIZATION: {
    icon: <Business style={{ fontSize: "16px", marginRight: "4px" }} />,
    color: "green",
  },
  DATE: {
    icon: <Event style={{ fontSize: "16px", marginRight: "4px" }} />,
    color: "purple",
  },
  DEFAULT: {
    icon: (
      <Person style={{ fontSize: "16px", marginRight: "4px", color: "#ccc" }} />
    ),
    color: "grey",
  },
};

function escapeRegex(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Replaces recognized NER entities in the text with styled HTML spans and icons.
 */
function highlightNER(text, nerResults) {
  if (!text || nerResults.length === 0) return text;

  const processedMatches = new Set();

  nerResults.forEach((result) => {
    const match = result.text;
    if (!processedMatches.has(match)) {
      const regex = new RegExp(`(${escapeRegex(match)})`, "gi");
      const labelData =
        labelIcons[result.label.toUpperCase()] || labelIcons.DEFAULT;
      const iconHtml = ReactDOMServer.renderToString(labelData.icon);
      const { start, end } = labelData.color || {};

      text = text.replace(regex, () => {
        return `
          <span style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            position: relative;
            border-radius: 4px;
            padding: 2px 4px;
          ">
            ${iconHtml}<strong>${match}</strong>
            <span style="
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 3px;
              background: linear-gradient(to right, ${start}, ${end});
            "></span>
          </span>
        `;
      });

      processedMatches.add(match);
    }
  });

  return text;
}

/** ----------------------------------
 *  MAIN APP COMPONENT
 *  ---------------------------------- */
function Main() {
  const [teiText, setTeiText] = useState("");
  const [teiMetadata, setTeiMetadata] = useState({});
  const [teiBody, setTeiBody] = useState("");
  const [nerResults, setNerResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [rdfResult, setRdfResult] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    mirador.viewer(config, [...annotationPlugins]);

    // Additional styling overrides for Mirador layout
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
      .mirador-viewer {
        left: 50% !important;
      }
      .mirador-workspace-viewport {
        padding-left: 0 !important;
      }
      .MuiAppBar-root {
       
      }
    `;
    document.head.appendChild(style);
  }, []);

  /** ----------------------------------
   *  TEI PARSING & NER
   *  ---------------------------------- */

  const parseTeiXml = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const title =
      xmlDoc.querySelector("title")?.textContent || "No title available";
    const author =
      xmlDoc.querySelector("author")?.textContent || "No author specified";
    const body =
      xmlDoc.querySelector("body")?.innerHTML || "No content available";

    setTeiMetadata({ title, author });
    setTeiBody(body);
    setTeiText(body); // Keep full text for potential NER
  };

  const loadTeiTextFromFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      parseTeiXml(event.target.result);
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
    reader.readAsText(file);
  };

  const applyNER = async () => {
    if (!teiText) {
      alert("Please load TEI text first!");
      return;
    }
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/process-ner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teiText }),
      });
      const data = await response.json();
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        setNerResults(data.nerResults);
      }
    } catch (error) {
      console.error("Error applying NER:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ----------------------------------
   *  ANNOTATIONS
   *  ---------------------------------- */
  const handleSaveAnnotations = (newAnnotations) => {
    setAnnotations(newAnnotations);
  };

  function formatString(input) {
    return input.trim().toLowerCase().replace(/\s+/g, "-");
  }

  function getCurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    // Format as YYYY-MM-DDTnn:nn:nnZ
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
  }

  const downloadAnnotations = async () => {
    // 1) Filter only final Web Annotation objects
    const finalAnnotations = annotations.filter(
      (anno) => anno.type === "Annotation"
    );

    // 2) Clean them by removing or ignoring your highlight fields
    const sanitized = finalAnnotations.map((anno) => {
      // We do a structured clone or shallow copy
      const clone = { ...anno };

      clone.hasEkphrasticModality = {
        id: `geko:ek-mod/${anno.body["ekphrastic-modality"]}`,
        type: anno.body["ekphrastic-modality"],
      };

      const firstTarget = clone.target;
      const secondTarget = anno.body["target"];

      clone.target = [
        { firstTarget },
        {
          source: {
            id: "https://digi.vatlib.it/iiif/MSS_Vat.gr.984/canvas/p0001",
            type: "Annotation",
          },
        },
      ];

      clone.wasGeneratedBy = {
        id: `geko:int-act/${uuidv4()}`,
        type: "InterpretationAct",
        hasInterpretationCriterion: {
          id: `geko:int-crit/${formatString(anno.body["int-criterion"])}`,
          type: "InterpretationCriterion",
        },
        hasInterpretationType: {
          id: `geko:int-type/${formatString(anno.body["int-type"])}`,
          type: "InterpretationType",
        },
      };

      (clone.hasAnchor = {
        label: anno.body["anchor"],
        id: `geko:anchor/${formatString(anno.body["anchor"])}`,
        type: "Anchor",
        hasConceptualLevel: {
          id: `geko:conc-lvl/${formatString(anno.body["icon-level"])}`,
          type: anno.body["icon-level"],
        },
        isAnchoredTo: {
          id: "https://www.wikidata.org/wiki/Q24011",
          type: "Entity",
        },
      }),
        (clone.created = getCurrentDateTime());

      (clone.creator = {
        id: `geko:creator/${formatString(anno.body["creator"])}`,
        type: "foaf:Person",
        name: anno.body["creator"],
      }),
        // Remove highlight data
        delete clone.body["int-type"];
      delete clone.body["int-criterion"];
      delete clone.body["ekphrastic-modality"];
      delete clone.body["anchor"];
      delete clone.body["entity"];
      delete clone.body["icon-level"];
      delete clone.body["creator"];
      delete clone.body["created"];
      delete clone.paragraphIndex;
      delete clone.startOffset;
      delete clone.endOffset;
      delete clone.selectedText;
      delete clone.tempId; // if it still exists

      console.log(clone);

      return clone;
    });

    // 3) Build an AnnotationPage
    const annotationCollection = {
      "@context": [
        "http://www.w3.org/ns/anno.jsonld",
        {
          mlao: "http://www.w3id.org/mlao/",
          oa: "https://www.w3.org/TR/annotation-vocab/#",
          crm: "http://erlangen-crm.org/current/",
          lrmoo: "http://iflastandards.info/ns/lrm/lrmoo/",
          rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          rdfs: "http://www.w3.org/2000/01/rdf-schema#",
          hico: "http://purl.org/emmedi/hico/",
          prov: "http://www.w3.org/ns/prov#",
          dct: "https://www.dublincore.org/specifications/dublin-core/dcmi-terms/",
          foaf: "http://xmlns.com/foaf/spec/",
          geko: "http://www.w3id.org/geko/",
          icon: "https://w3id.org/icon/ontology/",
          IconographicalSubject: "icon:IconographicalSubject",
          PreiconographicalSubject: "icon:PreiconographicalSubject",
          IconologicalSubject: "icon:IconologicalSubject",
          Entity: "crm:E1_Entity",
          Mimetic: "geko:Mimetic",
          Notional: "geko:Notional",
          Dynamization: "geko:Dynamization",
          Denotation: "geko:Denotation",
          Integration: "geko:Integration",
          Ekphrasis: "geko:Ekphrasis",
          hasEkphrasticModality: "geko:hasEkphrasticModality",
          hasTextualReferent: "geko:hasTextualReferent",
          hasIconicReferent: "geko:hasIconicReferent",
          hasForm: "geko:hasForm",
          wasGeneratedBy: "prov:wasGeneratedBy",
          hasConceptualLevel: "mlao:hasConceptualLevel",
          hasInterpretationCriterion: "hico:hasInterpretationCriterion",
          hasInterpretationType: "hico:hasInterpretationType",
          InterpretationType: "hico:InterpretationType",
          InterpretationAct: "hico:InterpretationAct",
          InterpretationCriterion: "hico:InterpretationCriterion",
          hasAnchor: "mlao:hasAnchor",
          isAnchoredTo: "mlao:isAnchoredTo",
          Anchor: "mlao:Anchor",
          Work: "http://iflastandards.info/ns/lrm/lrmoo/F1_Work",
          Expression: "http://iflastandards.info/ns/lrm/lrmoo/F2_Expression",
          Manifestation: "http://iflastandards.info/ns/lrm/lrmoo/F3_Manifestation",
          Item: "http://iflastandards.info/ns/lrm/lrmoo/F5_Item",
        },
      ],
      id: `geko:annotation-page/${uuidv4()}`, //"localStorage://?canvasId=example", // etc.
      type: ["AnnotationCollection", "geko:Ekphrasis"],
      hasForm: {
        id: `geko:form-mimetic`,
        type: "Mimetic",
      },
      hasTextualReferent: {
        id: `geko:riviere-text-ek`,
        type: "Expression",
      },
      hasIconicReferent: {
        id: `https://www.wikidata.org/wiki/Q24011`,
        type: "Work",
      },
      items: sanitized, // your cleaned final annotations
    };

    // 4) Convert to JSON and download
    const blob = new Blob([JSON.stringify(annotationCollection, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const rdfData = await toRdf(annotationCollection);

    console.log(rdfData);
    const link = document.createElement("a");
    link.href = url;
    link.download = "annotations.jsonld";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function toRdf(jsonLdData, format = "application/n-quads") {
      try {
        // Use the jsonld.toRDF function to convert JSON-LD to a desired RDF format
        const rdfData = await jsonld.toRDF(jsonLdData, { format: format });
        return rdfData;
      } catch (error) {
        console.error("Error converting JSON-LD to RDF:", error);
        return null;
      }
    }

  async function convertJsonLd(collection) {
    try {
      /**
       * toRDF can produce either an RDF 'dataset' (JSON object) or an N-Quads string.
       * We'll specify "application/n-quads" to get a simple text-based output.
       */
      const nquads = await jsonld.toRDF(collection, {
        format: "application/n-quads",
      });

      // `nquads` is a string in N-Quads syntax (like Turtle but with graph support).
      setRdfResult(nquads);
    } catch (err) {
      console.error("Conversion error:", err);
    }
  }

  /** ----------------------------------
   *  THEME TOGGLING
   *  ---------------------------------- */
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // After applying NER, we highlight text
  const highlightedText = highlightNER(teiText, nerResults);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        backgroundColor: theme === "light" ? "#ffffff" : "#121212",
        color: theme === "light" ? "#000000" : "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* LEFT COLUMN: TEI Metadata and Content */}
      <div
        style={{
          flex: 1,
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          paddingRight: "10px",
        }}
      >
        <Box sx={{ padding: 2, marginBottom: 10, textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            GEKO ANNOTATOR
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Left Buttons */}
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            {/* Download Button */}
            <Button
              variant="contained"
              color="primary"
              onClick={downloadAnnotations}
              disabled={annotations.length === 0}
              startIcon={<GetApp />}
              sx={{ width: "150px", textTransform: "none" }}
            >
              Download Annotations
            </Button>

            {/* NER Placeholder Button (not calling applyNER yet) */}
            <Button
              variant="outlined"
              sx={{ width: "100px", textTransform: "none" }}
              startIcon={<AccountTree />}
              onClick={applyNER} // If you want to run NER here
              disabled={!teiBody || loading}
            >
              {loading ? "Processing..." : "NER"}
            </Button>
          </Box>

          {/* Right Buttons: Theme Switch */}
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => setTheme("light")}
              sx={{
                minWidth: "50px",
                minHeight: "50px",
                borderRadius: "50%",
                backgroundColor: theme === "light" ? "#f0f0f0" : "#666666",
                color: theme === "light" ? "#121212" : "#ffffff",
              }}
            >
              <Brightness5 />
            </Button>
            <Button
              variant="contained"
              onClick={() => setTheme("dark")}
              sx={{
                minWidth: "50px",
                minHeight: "50px",
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#666666" : "#f0f0f0",
                color: theme === "dark" ? "#ffffff" : "#121212",
              }}
            >
              <Brightness3 />
            </Button>
          </Box>
        </Box>

        {/* TEI Metadata & Body OR TextAnnotatorComponent */}
        <div
          style={{
            marginTop: "10px",
            overflow: "auto",
            backgroundColor: "#f9f9f9",
            padding: "10px",
            border: "1px solid #ddd",
            height: "100%",
          }}
        >
          {/* If TEI body is loaded, show TEI data; otherwise, show the text annotator */}
          {teiBody ? (
            <>
              {/* TEI Metadata */}
              {teiMetadata.title && (
                <div style={{ marginBottom: "20px" }}>
                  <h4>{teiMetadata.title}</h4>
                  <p>
                    <i>{teiMetadata.author}</i>
                  </p>
                </div>
              )}

              {/* TEI Body with possible NER highlights */}
              <div dangerouslySetInnerHTML={{ __html: highlightedText }} />

              {/* NER Results (if any) */}
              {nerResults.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h4>NER Results:</h4>
                  <ul>
                    {nerResults.map((result, index) => (
                      <li key={index}>
                        <strong>{result.text}</strong> ({result.label})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            /* NO TEI Body? Show the custom text annotator */
            <div style={{ padding: "20px" }}>
              <TextAnnotatorComponent onSave={handleSaveAnnotations} />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Mirador Viewer */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div id="mirador" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

ReactDOM.render(<Main />, document.getElementById("root"));

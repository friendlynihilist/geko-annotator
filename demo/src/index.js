import React, { useEffect, useState } from "react";
import ReactDOMServer from "react-dom/server";
import ReactDOM from "react-dom";
import mirador from "mirador/dist/es/src/index";
import annotationPlugins from "../../src";
import LocalStorageAdapter from "../../src/LocalStorageAdapter";
import TextAnnotatorComponent from "../../src/TextAnnotatorComponent";
import { Person, Place, Business, Event, Brush } from "@material-ui/icons";
import { updateWorkspaceMosaicLayout } from "mirador/dist/es/src/state/actions";
import { getWorkspaceType } from "mirador/dist/es/src/state/selectors";

if (!document.getElementById("root")) {
  const rootDiv = document.createElement("div");
  rootDiv.id = "root";
  document.body.appendChild(rootDiv);
}

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
    sideBarOpenByDefault: true,
  
  },
  windows: [
    {
      loadedManifest:
        "https://digi.vatlib.it/iiif/MSS_Vat.gr.984/manifest.json",
    },
  ],
};

// Helper function to highlight NER results in the TEI text
const highlightNER = (text, nerResults) => {
  if (!text || nerResults.length === 0) return text;

  // Map labels to Material-UI icon components
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
        <Person
          style={{ fontSize: "16px", marginRight: "4px", color: "#ccc" }}
        />
      ),
      color: "grey",
    },
  };

  // Escape special characters for RegExp
  const escapeRegex = (str) => str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  // Track processed matches
  const processedMatches = new Set();

  // Replace matches only once
  nerResults.forEach((result) => {
    const match = result.text;
    if (!processedMatches.has(match)) {
      const regex = new RegExp(`(${escapeRegex(match)})`, "gi");
      const labelData =
        labelIcons[result.label.toUpperCase()] || labelIcons.DEFAULT;
      const icon = ReactDOMServer.renderToString(labelData.icon); // Convert icon to HTML
      const color = labelData.color;

      text = text.replace(
        new RegExp(`(${escapeRegex(result.text)})`, "gi"),
        `<span style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        position: relative;
        border-radius: 4px;
        padding: 2px 4px;"
      >
        ${icon}<strong>${match}</strong>
        <span style="
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, ${color.start}, ${color.end});
        "></span>
      </span>`
      );

      processedMatches.add(match);
    }
  });

  return text;
};

const Main = () => {
  const [teiText, setTeiText] = useState("");
  const [teiMetadata, setTeiMetadata] = useState({});
  const [teiBody, setTeiBody] = useState("");
  const [nerResults, setNerResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mirador.viewer(config, [...annotationPlugins]);

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
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

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
    setTeiText(body); // Keep full text for NER || FIXME: add xmlString
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
        headers: {
          "Content-Type": "application/json",
        },
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

  const highlightedText = highlightNER(teiText, nerResults);

  return (
    <div
      style={{
        height: "100vh",
        lineHeight: "3",
        fontFamily: "Arial, sans-serif",
        display: "flex",
      }}
    >
      {/* Left Column for TEI Metadata and Content */}
      <div
        style={{
          flex: 1,
          borderRight: "1px solid #ccc",
          display: "flex",
          flexDirection: "column",
          paddingRight: "10px",
        }}
      >
        {/* <h3>TEI Text Viewer</h3> */}

        <input
          type="file"
          accept=".xml"
          onChange={(e) => {
            if (e.target.files.length > 0) {
              loadTeiTextFromFile(e.target.files[0]);
            }
          }}
          style={{ marginTop: "10px" }}
        />
        {teiBody ? (
            <button onClick={applyNER} disabled={loading}>
            {loading ? "Processing..." : "Apply NER"}
          </button>
          ) : (
            ''
          )}
        
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
          {/* Metadata Display */}
          {teiMetadata.title && (
            <div style={{ marginBottom: "20px" }}>
              <h4>{teiMetadata.title}</h4>
              <p>
                <i>{teiMetadata.author}</i>
              </p>
            </div>
          )}

          {/* Body Content */}
          {teiBody ? (
            <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
          ) : (
            <TextAnnotatorComponent />
          )}
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
        </div>
      </div>

      {/* Mirador Viewer */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div id="mirador" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

ReactDOM.render(<Main />, document.getElementById("root"));

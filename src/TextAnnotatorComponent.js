import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Typography,
  Grid,
  Divider,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  StylesProvider,
  ThemeProvider,
  createTheme,
} from "@material-ui/core/styles";
import { createGenerateClassName } from "@material-ui/core/styles";
import { v4 as uuidv4 } from "uuid";

/** -------------------------------
 *  TEXT EDITOR (for body content)
 *  ------------------------------- */
const TextEditor = ({ annoHtml, updateAnnotationBody }) => (
  <textarea
    value={annoHtml}
    onChange={(e) => updateAnnotationBody(e.target.value)}
    rows="4"
    style={{ width: "100%", padding: "8px", fontSize: "14px" }}
  />
);

/** -------------------------------
 *  CLASSNAME + THEME
 *  ------------------------------- */
const generateClassName = createGenerateClassName({
  productionPrefix: "annotator",
});

const annotatorTheme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
});

/**
 * Central config for all dropdowns.
 * Add or remove fields here.
 */
const DROPDOWN_CONFIG = [
  {
    id: "anchor",
    label: "has anchor",
    options: ["Mademoiselle Riviére", "Anchor 2", "Anchor 3"],
  },
  {
    id: "target",
    label: "has target annotation",
    options: ["Annotation 1", "Annotation 2", "Annotation 3"],
  },
  {
    id: "icon-level",
    label: "has conceptual level",
    options: [
      "Preiconographical Level",
      "Iconographical Level",
      "Iconological Level",
    ],
  },
  {
    id: "entity",
    label: "is anchored to entity",
    options: ["Mademoiselle Caroline Riviére"],
  },
  {
    id: "int-criterion",
    label: "has interpretation criterion",
    options: ["scholarly expertise", "Criterion 2", "Criterion 3"],
  },
  {
    id: "int-type",
    label: "has interpretation type",
    options: ["literary analysis", "Type 2", "Type 3"],
  },
  {
    id: "ekphrastic-modality",
    label: "has ekphrastic modality",
    options: ["Denotation", "Dynamisation", "Integration"],
  },
  {
    id: "creator",
    label: "creator",
    options: ["Author 1", "Author 2", "Author 3"],
  },
];

/** -------------------------------
 *  ANNOTATION POPUP
 *  ------------------------------- */
function AnnotationPopup({
  popupData,
  onSave,
  onDelete,
  onCancel,
  formData,
  setFormData,
  handleFieldChange,
  annoBody,
  setAnnoBody,
}) {
  if (!popupData) return null;

  const { top, left, annotation } = popupData;

  return (
    <div
      style={{
        position: "absolute",
        top: top + 20,
        left,
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 10,
        width: "300px",
      }}
    >
      <Grid container spacing={2}>
        {/* Dynamically create one <Autocomplete> per DROPDOWN_CONFIG entry */}
        {DROPDOWN_CONFIG.map((field) => (
          <Grid item xs={12} key={field.id}>
            <Autocomplete
              freeSolo
              size="small"
              value={formData[field.id]} // e.g. formData.anchor, formData.entity, etc.
              onChange={(event, newValue) =>
                handleFieldChange(field.id, newValue || "")
              }
              options={field.options}
              renderInput={(params) => (
                <TextField {...params} label={field.label} variant="standard" />
              )}
            />
            <Divider flexItem orientation="horizontal" />
          </Grid>
        ))}

        <Grid item xs={12}>
          <Typography variant="overline">Content</Typography>
        </Grid>
        <Grid item xs={12}>
          <TextEditor annoHtml={annoBody} updateAnnotationBody={setAnnoBody} />
        </Grid>
      </Grid>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onSave(annotation.tempId)}
        >
          Save
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => onDelete(annotation.tempId)}
        >
          Delete
        </Button>
        <Button variant="contained" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/** -------------------------------
 *  MAIN COMPONENT
 *  ------------------------------- */
function TextAnnotatorComponent({ onSave }) {
  const containerRef = useRef(null);

  // All annotations (draft or final)
  const [annotations, setAnnotations] = useState([]);

  // Popup info (position + which annotation is being edited)
  const [popupData, setPopupData] = useState(null);

  /**
   * Single formData object for dynamic dropdown fields.
   * Keys correspond to DROPDOWN_CONFIG ids (anchor, entity, etc.)
   */
  const [formData, setFormData] = useState({
    anchor: "",
    entity: "",
    criterion: "",
    author: "",
  });

  // The text content for the annotation body
  const [annoBody, setAnnoBody] = useState("");

  // Example text content to annotate
  const content = [
    {
      id: 1,
      text: "Ci ricordiamo dei suoi corpi di giovani collocati in una luce diffusa e discreta, come quella di un eterno pomeriggio di settembre: come il Battista di Londra, il cui capo giovanile di capelli si confonde con le fronde degli alberi. Capelli e fronde, simbolo della natura operante e riposata. O come il Battista di Torino, pieno di una esuberante vita amorosa contenuta. Ci ricordiamo del corpo della Cleopatra di Pitti. Il femminile spasimo di questa persona, superato il disordine della passione dolorosa, è giunto al punto in cui potrebbe esprimersi in canto. La sua armoniosa nudità, così casta e tuttavia consapevole del sesso, parla eloquente dall'ampia curva delle spalle di carne, serena di potenza dentro una stanza consueta, tra i drappi delle tende e il tepore dei cuscini, allietata, prima di morte, dalla freschezza dei fichi verdi raccolti nel cestello.",
    },
    {
      id: 2,
      text: "Omaggio del pittore all'arte di Borgogna, di Fiandra ('Jean de Bruges...'), prima del tuffo in quella di Roma, di Firenze. Dunque, è l'ora d'Italia. Con l'amico scultore Lorenzo Bartolini, ne avevano ragionato, fantasticato a lungo, nelle serate parigine, uscendo dalla Scuola di. E si erano recati, per chiarirsi al Louvre. Così, in Ingres, la scoperta, l'idea di Raffaello, prima ancora di provarlo in Italia. Coaì la fiducia, sulla parola, nel Cinquecento fiorentino: Il Santo, Fra Bartolomeo, Pontormo, Salviati: Il Bartolini funzionava come eccitante culturale. Appena in tempo, prima di fare le valigie, Ingres lo dipinge: ritto in piedi, eloquente nel gesto come un nell'arresto di David, il volto e lo sguardo.",
    },
  ];

  /**
   * Universal field change handler.
   * Updates formData and also merges the new field into the DRAFT annotation.
   */
  function handleFieldChange(fieldId, newValue) {
    // 1) Update local formData state
    setFormData((prev) => ({ ...prev, [fieldId]: newValue }));

    // 2) Update the DRAFT annotation in 'annotations' if popup is open
    if (popupData?.annotation?.tempId) {
      setAnnotations((prevAnn) =>
        prevAnn.map((anno) =>
          anno.tempId === popupData.annotation.tempId
            ? { ...anno, [fieldId]: newValue }
            : anno
        )
      );
    }
  }

  /**
   * On mouse up => create a DRAFT annotation if user selected text
   */
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    const range = selection.getRangeAt(0);
    const paragraphElement = range.startContainer.parentNode;
    if (!paragraphElement) {
      selection.removeAllRanges();
      return;
    }

    const paragraphIndex = Array.from(containerRef.current.children).findIndex(
      (p) => p === paragraphElement
    );
    if (paragraphIndex === -1) {
      selection.removeAllRanges();
      return;
    }

    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    // Create a new draft annotation
    const draftAnnotation = {
      tempId: uuidv4(),
      selectedText,
      paragraphIndex,
      startOffset,
      endOffset,
      // Also store the dynamic fields (currently empty)
      anchor: "",
      entity: "",
      criterion: "",
      author: "",
    };

    // Add to state
    setAnnotations((prev) => [...prev, draftAnnotation]);

    // Prepare the popup
    setPopupData({
      annotation: draftAnnotation,
      top: range.getBoundingClientRect().top + window.scrollY,
      left: range.getBoundingClientRect().left + window.scrollX,
    });

    // Clear selection
    selection.removeAllRanges();

    // Reset the form fields in popup
    setFormData({
      anchor: "",
      entity: "",
      criterion: "",
      author: "",
    });
    setAnnoBody("");
  };

  // function parseConfig(anno, prop) {
  //   for (field in anno) {
  //     if (field.id === prop) {
  //       return field.id
  //     }
  //   }
  // }

  /**
   * Convert DRAFT annotation => final Web Annotation
   */
  const handleSave = (tempId) => {
    setAnnotations((prev) => {
      const updatedAnnotations = prev.map((anno) => {
        if (anno.tempId === tempId) {
          // Build final Web Annotation using dynamic fields from the annotation itself
          // (which were updated in handleFieldChange).
          return {
            id: `http://example.org/annotation/${uuidv4()}`,
            type: "Annotation",
            motivation: "commenting",

            body: {
              type: "TextualBody",
              value: annoBody,
              format: "text/plain",

              // Merge all dynamic fields from DROPDOWN_CONFIG
              ...DROPDOWN_CONFIG.reduce((acc, field) => {
                acc[field.id] = anno[field.id] || "";
                return acc;
              }, {}),
            },
            target: {
              source: "placeholder:someTextResource",
              selector: {
                type: "TextQuoteSelector",
                exact: anno.selectedText,
              },
            },
            // hasAnchor: {
            //   label: "Scriptio Superior",
            //   id: "https://purl.archive.org/domain/mlao/anchor/scriptio-superior",
            //   type: "Anchor",
            //   hasConceptualLevel: {
            //     id: "https://purl.archive.org/domain/mlao/Work/0a2cfaf8-917b-488a-8dc8-0def37a1f427",
            //     type: "Work",
            //   },
            //   isAnchoredTo:
            //     "https://purl.archive.org/domain/mlao/manuscript-vatgr984",
            // },
            // wasGeneratedBy: {
            //   id: "https://purl.archive.org/domain/mlao/interpretation/565ed67b-9bc1-4fce-894e-3960d473fa57",
            //   type: "InterpretationAct",
            //   hasInterpretationCriterion: {
            //     id: "https://purl.archive.org/domain/mlao/interpretation/criterion/diplomatic-transcription",
            //     type: "InterpretationCriterion",
            //   },
            // },
            // creator: {
            //   id: "https://purl.archive.org/domain/mlao/creator/m-f-bocchi",
            //   type: "foaf:Person",
            //   name: "M. F. Bocchi",
            // },
            // hasEkphrasticModality: {
            //   id: "https://purl.archive.org/domain/mlao/interpretation/565ed67b-9bc1-4fce-894e-3960d473fa57",
            //   type: "geko:Dynamisation",
            // },
            // Keep highlight info
            paragraphIndex: anno.paragraphIndex,
            startOffset: anno.startOffset,
            endOffset: anno.endOffset,
            selectedText: anno.selectedText,
            tempId: undefined,
          };
        }
        return anno;
      });

      if (onSave) onSave(updatedAnnotations);
      return updatedAnnotations;
    });

    closePopup();
  };

  /**
   * Delete => remove the annotation from state
   */
  const handleDelete = (tempId) => {
    setAnnotations((prev) => {
      const updated = prev.filter(
        (anno) => anno.tempId !== tempId && anno.id !== tempId
      );
      if (onSave) onSave(updated);
      return updated;
    });
    closePopup();
  };

  /**
   * Re-open popup to edit existing annotation
   */
  const handleEdit = (anno) => {
    setPopupData((prev) => ({
      ...prev,
      annotation: anno,
    }));

    // Check if the annotation is final (anno.body exists and is TextualBody)
    if (anno.body && anno.body.type === "TextualBody") {
      // It's a final annotation with a single body object
      setAnnoBody(anno.body.value || "");

      // Rebuild formData from the stored dynamic fields
      const dynamicFields = DROPDOWN_CONFIG.reduce((acc, field) => {
        acc[field.id] = anno.body[field.id] || "";
        return acc;
      }, {});

      setFormData(dynamicFields);
    } else {
      // If it's still draft or doesn't have a valid body object
      setAnnoBody("");
      setFormData({
        anchor: anno.anchor || "",
        entity: anno.entity || "",
        criterion: anno.criterion || "",
        author: anno.author || "",
      });
    }
  };

  /**
   * Render text with highlights
   */
  const renderTextWithAnnotations = (paragraph, paragraphIndex) => {
    const annotationsInParagraph = annotations.filter((a) => {
      // Draft
      if (a.paragraphIndex === paragraphIndex) return true;
      // Final
      if (a.target && a.paragraphIndex === paragraphIndex) return true;
      return false;
    });

    let currentIndex = 0;
    const parts = [];

    annotationsInParagraph.sort((a, b) => {
      const aStart = a.startOffset ?? a.target?.selector?.start ?? 0;
      const bStart = b.startOffset ?? b.target?.selector?.start ?? 0;
      return aStart - bStart;
    });

    annotationsInParagraph.forEach((anno) => {
      const startOffset = anno.startOffset || 0;
      const endOffset = anno.endOffset || 0;
      const text = anno.selectedText || "";

      if (startOffset > currentIndex) {
        parts.push(paragraph.text.slice(currentIndex, startOffset));
      }

      parts.push(
        <span
          key={anno.tempId || anno.id}
          style={{
            backgroundColor: "lightyellow",
            borderBottom: "2px dotted orange",
            cursor: "pointer",
          }}
          onClick={() => handleEdit(anno)}
        >
          {text}
        </span>
      );
      currentIndex = endOffset;
    });

    if (currentIndex < paragraph.text.length) {
      parts.push(paragraph.text.slice(currentIndex));
    }

    return parts;
  };

  /**
   * Close the popup, reset local form states
   */
  const closePopup = () => {
    setPopupData(null);
    setAnnoBody("");
    // Reset everything in formData
    setFormData({
      anchor: "",
      entity: "",
      criterion: "",
      author: "",
    });
  };

  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={annotatorTheme}>
        <div
          ref={containerRef}
          onMouseUp={handleMouseUp}
          style={{
            padding: "20px",
            lineHeight: "1.8",
            backgroundColor: "#f4f4f4",
            border: "1px solid #ccc",
            borderRadius: "8px",
            position: "relative",
          }}
        >
          {/* RENDER PARAGRAPHS */}
          {content.map((paragraph, index) => (
            <p key={paragraph.id}>
              {renderTextWithAnnotations(paragraph, index)}
            </p>
          ))}

          {/* POPUP FOR ANNOTATION CREATION/EDIT */}
          <AnnotationPopup
            popupData={popupData}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={closePopup}
            // Pass form data + change handler
            formData={formData}
            setFormData={setFormData}
            handleFieldChange={handleFieldChange}
            // Body text
            annoBody={annoBody}
            setAnnoBody={setAnnoBody}
          />
        </div>
      </ThemeProvider>
    </StylesProvider>
  );
}

TextAnnotatorComponent.propTypes = {
  onSave: PropTypes.func,
};

export default TextAnnotatorComponent;

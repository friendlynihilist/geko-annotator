import React, { useState } from "react";
import { TextAnnotator } from "@recogito/react-text-annotator";

const RecogitoLoader = () => {
  const [annotations, setAnnotations] = useState([]);

  const handleAnnotationCreated = (annotation) => {
    console.log("Annotation created:", annotation);
    setAnnotations((prev) => [...prev, annotation]);
  };

  const handleAnnotationUpdated = (annotation, previous) => {
    console.log("Annotation updated:", annotation, "Previous:", previous);
    setAnnotations((prev) =>
      prev.map((a) => (a.id === previous.id ? annotation : a))
    );
  };

  const handleAnnotationDeleted = (annotation) => {
    console.log("Annotation deleted:", annotation);
    setAnnotations((prev) => prev.filter((a) => a.id !== annotation.id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h3>React Text Annotator Example</h3>
      <TextAnnotator
        content="This is a sample text for annotation. Highlight text to create an annotation."
        annotations={annotations}
        onAnnotationCreated={handleAnnotationCreated}
        onAnnotationUpdated={handleAnnotationUpdated}
        onAnnotationDeleted={handleAnnotationDeleted}
      />
    </div>
  );
};

export default RecogitoLoader;

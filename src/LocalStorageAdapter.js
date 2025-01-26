import jsonld from "jsonld";
import axios from "axios";

/** */
export default class LocalStorageAdapter {
  /** */
  constructor(annotationPageId) {
    this.annotationPageId = annotationPageId;
  }

  /** */
  async create(annotation) {
    const emptyAnnoPage = {
      "@context": [
        "http://www.w3.org/ns/anno.jsonld",
        {
          mlao: "https://purl.archive.org/domain/mlao/",
          oa: "https://www.w3.org/TR/annotation-vocab/#",
          ecrm: "http://erlangen-crm.org/current/",
          lrmoo: "http://iflastandards.info/ns/lrm/lrmoo/",
          rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
          rdfs: "http://www.w3.org/2000/01/rdf-schema#",
          hico: "http://purl.org/emmedi/hico/",
          prov: "http://www.w3.org/ns/prov#",
          dct: "https://www.dublincore.org/specifications/dublin-core/dcmi-terms/",
          foaf: "http://xmlns.com/foaf/spec/",
          geko: "http://www.w3id.org/geko",
          Ekphrasis: "geko:Ekphrasis",
          hasEkphrasticModality: "geko:hasEkphrasticModality",
          hasTextualReferent: "geko:hasTextualReferent",
          hasIconicReferent: "geko:hasIconicReferent",
          hasForm: "geko:hasForm",
          wasGeneratedBy: "prov:wasGeneratedBy",
          hasConceptualLevel: "mlao:hasConceptualLevel",
          hasInterpretationCriterion: "hico:hasInterpretationCriterion",
          InterpretationAct: "hico:InterpretationAct",
          InterpretationCriterion: "hico:InterpretationCriterion",
          hasAnchor: "mlao:hasAnchor",
          isAnchoredTo: "mlao:isAnchoredTo",
          Anchor: "mlao:Anchor",
          creator:
            "https://www.dublincore.org/specifications/dublin-core/dcmi-terms/creator",
          Person: "http://xmlns.com/foaf/spec/Person",
          name: "http://xmlns.com/foaf/spec/name",
          Work: "http://iflastandards.info/ns/lrm/lrmoo/F1_Work",
          Expression: "http://iflastandards.info/ns/lrm/lrmoo/F2_Expression",
          Manifestation:
            "http://iflastandards.info/ns/lrm/lrmoo/F3_Manifestation",
          Item: "http://iflastandards.info/ns/lrm/lrmoo/F5_Item",
        },
      ],
      id: this.annotationPageId,
      items: [],
      type: "AnnotationPage",
    };
    const annotationPage = (await this.all()) || emptyAnnoPage;
    annotationPage.items.push(annotation);
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
    console.log(
      "THIS IS THE ANNOTATION PAGE CONSOLE LOG ------->",
      annotationPage
    );
    // const rdf = await this.toRdf(annotationPage);
    // console.log(await this.toRdf(annotationPage));
    const rdfData = await this.toRdf(annotationPage);
    //     const rdfData = `
    // <http://example.org/resource4> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Type1> .
    // <http://example.org/resource4> <http://example.org/property1> "FUNZIONA" .
    // <http://example.org/resource5> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://example.org/Type2> .
    // `;

    await this.saveRdf(rdfData);
    return annotationPage;
  }

  /** */
  async update(annotation) {
    const annotationPage = await this.all();
    if (annotationPage) {
      const currentIndex = annotationPage.items.findIndex(
        (item) => item.id === annotation.id
      );
      annotationPage.items.splice(currentIndex, 1, annotation);
      localStorage.setItem(
        this.annotationPageId,
        JSON.stringify(annotationPage)
      );
      return annotationPage;
    }
    return null;
  }

  /** */
  async delete(annoId) {
    const annotationPage = await this.all();
    if (annotationPage) {
      annotationPage.items = annotationPage.items.filter(
        (item) => item.id !== annoId
      );
    }
    localStorage.setItem(this.annotationPageId, JSON.stringify(annotationPage));
    return annotationPage;
  }

  /** */
  async get(annoId) {
    const annotationPage = await this.all();
    if (annotationPage) {
      return annotationPage.items.find((item) => item.id === annoId);
    }
    return null;
  }

  /** */
  async toRdf(jsonLdData, format = "application/n-quads") {
    try {
      // Use the jsonld.toRDF function to convert JSON-LD to a desired RDF format
      const rdfData = await jsonld.toRDF(jsonLdData, { format: format });
      return rdfData;
    } catch (error) {
      console.error("Error converting JSON-LD to RDF:", error);
      return null;
    }
  }

  /** */
  async saveRdf(rdfData) {
    console.log(rdfData);
    try {
      const response = await axios.post(
        "http://localhost:80/blazegraph/sparql",
        rdfData,
        {
          headers: {
            "Content-Type": "text/x-nquads", // or other RDF MIME type depending on your RDF format
          },
        }
      );
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error saving RDF:", error);
    }
  }

  /** */
  async all() {
    return JSON.parse(localStorage.getItem(this.annotationPageId));
  }
}

# GEKO Ekphrastic Annotator

This repository contains the **GEKO Annotator**, a React-based annotation client designed for ekphrastic studies. It allows users to create semantically enriched annotations on both text and image resources, leveraging **IIIF** for image distribution and **Blazegraph** for storing RDF data in the backend.  

The tool implements concepts from the [*General Ekphrastic Ontology (GEkO)*](https://example.org/geko-ontology) and reuses standard ontologies such as **CIDOC-CRM**, **LRMoo**, **HiCO**, and the **W3C Web Annotation Data Model**.

## Features

- **Semantic Annotations**: Associate textual excerpts and image regions with formal concepts (e.g., rhetorical modalities, conceptual levels, real-world entities).  
- **IIIF Integration**: Uses the [International Image Interoperability Framework](https://iiif.io/) for standard image requests/responses.  
- **Blazegraph Storage**: Outputs annotations in JSON-LD or RDF and persists them in a triple store.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Cantaloupe IIIF Setup](#cantaloupe-iiif-setup)
- [Blazegraph Setup](#blazegraph-setup)
- [License](#license)

---

## Prerequisites

1. **Node.js** (v14+ recommended) and **npm** or **yarn** for the React front-end.  
2. **Cantaloupe IIIF server** (4.x+ recommended) to serve images via IIIF.  
3. **Blazegraph** (or another SPARQL-capable triple store) to store annotations in RDF.  

---

## Installation

1. **Clone this repository**:
   ```bash
   git clone https://github.com/your-username/geko-annotator.git
   cd geko-annotator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn
   ```

3. **Configure environment** (if needed).  
   - Create a `.env` file with your desired variables (e.g., Blazegraph endpoint URL, IIIF server base URL).

---

## Development

To run the development server with hot reloading:

```bash
npm start
```
or
```bash
yarn start
```

- The app will be accessible at [http://localhost:3000](http://localhost:3000).  
- Make sure your **Cantaloupe server** and **Blazegraph** endpoint are running and **configured** so the annotator can communicate with them (e.g., via environment variables or local config).

### Building for Production

```bash
npm run build
```
or
```bash
yarn build
```
This will generate a production-ready bundle in the `build/` folder.

---

## Cantaloupe IIIF Setup

The **Cantaloupe** server provides a IIIF interface to your images, so you can annotate them through Mirador or the custom annotator plugin.

1. **Download & Install**  
   - Obtain the [Cantaloupe WAR or standalone ZIP](https://github.com/medusa-project/cantaloupe).
   - If using the **standalone** distribution, unpack it somewhere on your server.

2. **Configuration**  
   - Edit the `cantaloupe.properties` file to set up basics like `HttpSource.basic_auth_username/password` (if needed), cache directory, logging, etc.  
   - Example snippet:
     ```properties
     http.port = 8182
     logging.level.root = info
     # ...
     FilesystemSource.BasicLookupStrategy.path_prefix = /path/to/your/images
     ```

3. **Run Cantaloupe**  
   - **Standalone**:
     ```bash
     ./cantaloupe.sh
     ```
   - **Web application** (Tomcat/Jetty):
     ```bash
     cp cantaloupe.war /path/to/tomcat/webapps
     ```
4. **Verify** by visiting `http://localhost:8182/info.json` or using the IIIF info URL pattern.  
5. **Use** the IIIF Image URIs from Cantaloupe in your **GEKO Annotator** so your images load properly.

---

## Blazegraph Setup

**Blazegraph** is a triplestore that can store your JSON-LD annotations as RDF.

1. **Download** the [Blazegraph jar file](https://github.com/blazegraph/database/releases).  
2. **Run**:
   ```bash
   java -jar blazegraph.jar
   ```
   By default, it will start on port **9999**:
   - Admin UI: [http://localhost:9999/blazegraph](http://localhost:9999/blazegraph)  

3. **Create a namespace** (e.g., `geko`)  
   - In the left panel, click **“Namespaces”** → **Create**.  
   - Provide a name (e.g. `geko`) and set `quads = true` or `property = spoc`, depending on your preference.  
4. **Update Endpoint**:  
   - The SPARQL endpoint will typically be at:
     ```
     http://localhost:9999/blazegraph/namespace/geko/sparql
     ```
5. **Point** the **GEKO Annotator** to that endpoint.  
   - In your `.env` or config, set something like:
     ```bash
     REACT_APP_BLAZEGRAPH_ENDPOINT=http://localhost:9999/blazegraph/namespace/geko/sparql
     ```
   - Ensure your code references `process.env.REACT_APP_BLAZEGRAPH_ENDPOINT` (or similar) for queries/updates.

---

## License

Please see the [LICENSE](./LICENSE) file for details.  

---

### Questions / Issues

If you encounter any bugs or have feature requests, please open an **issue** in this repository.  

**Enjoy ekphrastic annotation!**
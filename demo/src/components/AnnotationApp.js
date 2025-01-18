import React from 'react';
import mirador from 'mirador/dist/es/src/index';
import annotationPlugins from '../../../src';
import LocalStorageAdapter from '../../../src/LocalStorageAdapter';

// TEI Publisher Wrapper Component
const TEIPublisherViewer = () => {
  useEffect(() => {
    // Load TEI Publisher Web Components
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@teipublisher/pb-components@latest/dist/pb-components-bundle.js';
    script.type = 'module';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <pb-page endpoint="https://teipublisher.com/exist/apps/tei-publisher">
        <pb-document id="document1" path="test/F-rom.xml" odd="shakespeare"></pb-document>

        <pb-progress></pb-progress>
        {/* Output the document title */}
        <pb-view src="document1" xpath="//teiHeader/fileDesc/titleStmt" view="single">
          <pb-param name="mode" value="title" />
        </pb-view>
        <pb-view
          id="view1"
          src="document1"
          view="page"
          append-footnotes
          animation
          column-separator=".tei-cb"
        ></pb-view>
        <footer>
          {/* Navigate to next page */}
          <pb-navigation direction="forward" keyboard="right">
            <button>
              <span>➡</span>
            </button>
          </pb-navigation>
          {/* Navigate to previous page */}
          <pb-navigation direction="backward" keyboard="left">
            <button>
              <span>⬅</span>
            </button>
          </pb-navigation>
        </footer>
      </pb-page>
    </div>
  );
};

// Mirador Wrapper Component
const MiradorViewer = () => {
  React.useEffect(() => {
    const config = {
      annotation: {
        adapter: (canvasId) =>
          new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`),
        exportLocalStorageAnnotations: true,
      },
      id: 'mirador',
      windows: [
        {
          loadedManifest: 'https://digi.vatlib.it/iiif/MSS_Vat.gr.984/manifest.json',
        },
      ],
    };

    mirador.viewer(config, [...annotationPlugins]);
  }, []);

  return <div id="mirador" style={{ width: '100%', height: '100%' }} />;
};

// AnnotationApp Component
const AnnotationApp = () => {
  console.log("AnnotationApp rendering...");
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, borderRight: '1px solid #ccc' }}>
        <h3>Text Annotation (TEI Publisher)</h3>
        <TEIPublisherViewer />
      </div>
      <div style={{ flex: 1 }}>
        <h3>Image Annotation (Mirador)</h3>
        <MiradorViewer />
      </div>
    </div>
  );
};

export default AnnotationApp;


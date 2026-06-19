import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

/** Interactive, spec-driven API reference (rendered from the pinned openapi.json). */
export default function ApiReference() {
  return <ApiReferenceReact configuration={{ url: '/openapi.json', hideDownloadButton: false }} />;
}

import algoliasearch from "algoliasearch/lite";
import prettyBytes from "pretty-bytes";
import { useState } from "react";
import {
  InfiniteHits,
  InstantSearch,
  RangeInput,
  SearchBox,
  Snippet,
} from "react-instantsearch";
import Markdown from "react-markdown";
import "./App.css";

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY
);

export default function App() {
  return (
    <InstantSearch
      indexName={import.meta.env.VITE_ALGOLIA_INDEX_NAME}
      searchClient={searchClient}
    >
      <SearchBox placeholder="Search models..." />
      <div className="rangeInput">
        Size (in bytes) from
        <RangeInput attribute="size" />
      </div>
      <InfiniteHits hitComponent={HitComponent} showPrevious={false} />
    </InstantSearch>
  );
}

function HitComponent({ hit }: any) {
  const [isReadmeRendered, setIsReadmeRendered] = useState(false);

  return (
    <div className="hit">
      <dl>
        <div className="hit-attribute">
          <dt>id:</dt>
          <dd>{hit.id}</dd>
        </div>
        <div className="hit-attribute">
          <dt>author:</dt>
          <dd>{hit.author}</dd>
        </div>
        <div className="hit-attribute">
          <dt>size:</dt>
          <dd>{`${prettyBytes(hit.size)} (${hit.size} bytes)`}</dd>
        </div>
        <div className="hit-attribute">
          <dt>downloads:</dt>
          <dd>{hit.downloads}</dd>
        </div>
        <div className="hit-attribute">
          <dt>likes:</dt>
          <dd>{hit.likes}</dd>
        </div>
        <div className="hit-attribute">
          <dt>readme:</dt>
          <dd>
            <code>
              <pre>
                <Snippet hit={hit} attribute="readme" />
              </pre>
            </code>
          </dd>
        </div>
        {isReadmeRendered ? (
          <div className="hit-readme-rendered">
            <dt>full readme (rendered):</dt>
            <dd>
              <Markdown>{hit.readme}</Markdown>
            </dd>
          </div>
        ) : (
          <button onClick={() => setIsReadmeRendered(true)}>
            Render full readme
          </button>
        )}
      </dl>
    </div>
  );
}

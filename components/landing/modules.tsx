import type { ReactNode } from "react";
import { type ContentItem, modules } from "./content";
import {
  ConsistencyMock,
  CoverLetterMock,
  CvMock,
  DocumentsMock,
  GithubMock,
  LinkedinMock,
  TailoredMock,
  WebsiteMock,
} from "./module-mocks";
import { container, SectionHeading, targetHighlight } from "./ui";

/*
 * The eight modules as a grid of tiles in mixed sizes. Each tile shows a small
 * mock of the feature above its name. The CV builder, the centre of the
 * product, gets the largest tile; the consistency checker closes the grid as a
 * full-width row. Tile ids are the targets of the navigation menu.
 */
const layout: {
  id: string;
  /** Columns the tile takes on a 2-column (md) and 6-column (lg) grid. */
  span: string;
  mock: ReactNode;
  /** Full-width tile: text beside the mock on large screens. */
  wide?: boolean;
}[] = [
  { id: "module-cv", span: "md:col-span-2 lg:col-span-4", mock: <CvMock /> },
  {
    id: "module-cover-letter",
    span: "lg:col-span-2",
    mock: <CoverLetterMock />,
  },
  { id: "module-github", span: "lg:col-span-3", mock: <GithubMock /> },
  { id: "module-tailored", span: "lg:col-span-3", mock: <TailoredMock /> },
  { id: "module-linkedin", span: "lg:col-span-2", mock: <LinkedinMock /> },
  { id: "module-website", span: "lg:col-span-2", mock: <WebsiteMock /> },
  { id: "module-documents", span: "lg:col-span-2", mock: <DocumentsMock /> },
  {
    id: "module-consistency",
    span: "md:col-span-2 lg:col-span-6",
    mock: <ConsistencyMock />,
    wide: true,
  },
];

const byId = new Map(modules.map((item) => [item.id, item]));

function Tile({
  item,
  span,
  wide,
  children,
}: {
  item: ContentItem;
  span: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      id={item.id}
      data-reveal
      className={`flex flex-col rounded-3xl border border-line bg-surface p-2 ${targetHighlight} ${span} ${
        wide ? "lg:flex-row-reverse" : ""
      }`}
    >
      {/* The mock is an illustration; the text below carries the meaning.
          `data-mock` staggers its cards in and runs its counters and bars;
          `data-tilt` leans the mock towards the pointer. */}
      <div
        aria-hidden
        data-mock
        data-meter
        className={`@container flex flex-1 flex-col justify-center rounded-2xl bg-sand p-5 [perspective:900px] sm:p-7 ${
          wide ? "lg:p-9" : ""
        }`}
      >
        <div data-tilt>{children}</div>
      </div>
      <div
        className={`px-4 pt-5 pb-4 sm:px-5 sm:pt-6 sm:pb-5 ${
          wide ? "lg:flex lg:w-[36%] lg:flex-col lg:justify-center lg:px-8" : ""
        }`}
      >
        <h3 className="text-xl font-medium tracking-tight">{item.title}</h3>
        <p className="mt-2 leading-7 text-pretty text-ink-muted">
          {item.description}
        </p>
      </div>
    </li>
  );
}

export function Modules() {
  return (
    <section
      id="modules"
      className={`${container} scroll-mt-16 py-20 sm:py-32`}
    >
      <SectionHeading
        title="Everything an application needs, built from one profile."
        lead="Eight modules share the same facts, so your details are entered once and stay the same everywhere."
      />

      <ul className="mt-12 grid gap-4 sm:mt-14 sm:gap-5 md:grid-cols-2 lg:grid-cols-6">
        {layout.map((tile) => {
          const item = byId.get(tile.id);
          if (!item) return null;
          return (
            <Tile key={tile.id} item={item} span={tile.span} wide={tile.wide}>
              {tile.mock}
            </Tile>
          );
        })}
      </ul>
    </section>
  );
}

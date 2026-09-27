import type { JsonLdObject } from "@/seo.config";

/**
 * Renders schema.org structured data.
 *
 * `<` is escaped so a string inside the payload can never terminate the script
 * tag early (the standard safe-JSON-for-script pattern).
 */
export function JsonLd({
  data,
  id,
}: {
  data: JsonLdObject | JsonLdObject[];
  id?: string;
}) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default JsonLd;

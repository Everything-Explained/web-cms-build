# CMS Sanitization
[[process#API Data|Raw Storyblok data]] will be sanitized into an object that can represent Video and Literature entries.

## CMS Entry
```typescript
type ISODateString = string;    // 0000-00-00T00:00:00.000Z

const CMSEntry = {
  id        : number|string;
  title     : string;
  author    : string;
  category ?: string;
  summary  ?: string;
  body     ?: string;
  date      : ISODateString;
}

```


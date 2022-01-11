# The Programmatic flow of Data
Storyblok CMS is where we're storing our current dataset. Using their API, we get the following:
#### API Data
```JSON
{
  "name": "This is a title",
  "created_at": "2020-12-20T21:21:06.521Z",
  "published_at": "2021-04-21T00:50:08.000Z",
  "id": 72580,
  "content": {
    "id": "MkZtrGF1y7Y",
	"body": "This is some body content",
	"summary": "This is some kind of summary",
	"category": "--",
    "title": "This is a title",
    "author": "An Author",
	"timestamp": "0000-00-00T00:00:00.000Z"
  },
  "slug": "this-is-a-title",
  "full_slug": "path/to/this-is-a-title",
  "position": 930,
  "tag_list": [],
  "is_startpage": false,
  "meta_data": null,
  "first_published_at": "2021-01-19T01:48:39.767Z",
  "release_id": null,
  "lang": "default",
  "path": null,
}
```

---

## Relevant Data
In order for this data to be useful to a client, we need to sanitize it in a way that allows us to test for changes and slim it down for consumption. The subset of data below represents all relevant values and how we should arrive at those values.
![[CMS Sanitization#CMS Entry]]

#### ID
Required as a `number` or `string`. This property should be calculated using an existing `content.id` or the auto-generated `id` from Storyblok. The reason we look for a `content.id` is because our Video content uses this property as its Video ID, which will then be applied to a 3rd party lookup.

#### Title
Required to be a *string* no longer than `70` chars. Any longer than this and we'll have some display issues.

#### Author
Required to be a *string* with currently no size limit; we cannot force a user's name to be a certain size, so our UI must be able to accommodate the largest possible names.

#### Category
It must be a *string* containing the range of `AA, AB, AC...` to `AZ` where `--` means "none". This is an exclusive required property for Video content.

#### Summary
It can be *undefined*, *null*, or a *string* no longer than `500` chars. This is **not** necessarily a required property.

#### Body
It can be a *string* of any size. This **is** a required property, but it can be left empty. 

Video content should use this property for its Summary, because the `summary` property does not process Markdown, but Video Summaries must support Markdown.

#### Date
Required to be a *string* in ISO Date format.  You can see an example of this here: `0000-00-00T00:00:00.000Z`

If we hard-code a date (timestamp), we use that first, otherwise we move onto a "First Published Date" and if that doesn't exist, we resort to a date that is **always** available: *the Creation Date*. 

The reason we don't use the `published_at` date, is if the content is published after an update, the date will no longer reflect the original date it was published, which means it could be misinterpreted as "new content" (even by our own system) when in reality, its content has simply been "updated" to address some scrutiny.

## The Manifest
Once we have our relevant subset of data, we can then create a file manifest. This is necessary, so we can track changes to our content. Another feature of the Manifest, is that its `ver` string, will double as a cache-busting mechanism for the client when retrieving content.
![[CMS Sanitization#CMS Entry]]

The `body` property is removed...this is because only the `title` is required to reference that resource; this allows us to create a slim Manifest to send to a client device.

#### Version 
Required as a `10` char `string`. This property should be calculated using a hash of all relevant content properties using `JSON.stringify()`. The resulting hash will be truncated to `10` chars.

## Static Resources
During the first creation of the Manifest, we will create static resources from the body content. Each resource will be named by their slug, which is derived from their title. If we have a resource titled: `Who is God?` then its file name would be: `who-is-god.mdhtml`. The body content will be in HTML format, but because it's not a proper HTML document, we use the `.mdhtml` extension to signify that the content inside is HTML from a Markdown rendering process.

## Building the Data
- Get data from CMS
- Get existing Manifest from file
	- If Manifest does not exist, create it from the CMS data
		- Create static resources as well
			- **NOTE** This is only applicable to literature. Videos only require a manifest file.
- If Manifest exists, compare it against CMS data
	- Check for added IDs
		- If an ID from CMS data does not exist in the Manifest, then that ID is new.
			- Add static resource if applicable
	- Check for removed IDs
		- If an ID from the Manifest does not exist in CMS data, then that ID has been removed.
			- Delete static resource if applicable
	- Check for data changes
		- hash the CMS data and test it against the Manifest `ver`.
			- If it **does** match: no changes detected
			- If it does **not** match: update both the Manifest and the static resource. We update both because we don't know which properties have changed.
- If **ANY** changes are discovered - that means additions, removals, or updates - the Manifest should be recreated using the CMS data and the original Manifest discarded.

### Fetch Storyblok Data
The [[process#API Data|API Data]] will be retrieved from a Storyblok CDN URL that points to a specific resource.

### Sanitize Data 
Convert the raw Storyblok data into a [[CMS Sanitization#CMS Entry|CMS Entry]] object that can represent either Literature or Video entries.

#### id
Uses `content.id` or `story.id` to account for Video ID.
*Required* 

#### title
Uses `content.title` and should be no longer than `70` characters, enforced by Storyblok configuration. 
*Required* 

#### author
Uses `content.author` and currently has no size limit. 
*Required*

#### category
Uses `content.category` and contains an alphabet range of `AA` to `AZ` with a max range of `ZZ`. `--` is used to represent a *none* value. 
*Optional*

#### summary
Uses `content.summary` and should be no longer than `500` characters. It should be passed into Markdown-it `renderInline()`; this will prevent `<p>` tags, but still process new lines as `<br>` and converts all other Markdown syntax to HTML.
*Optional*

#### body
Uses `content.body` and currently has no size limit. Videos do not have a body, because the video itself **is** the body.
*Optional*

#### date
Uses `content.timestamp` or `first_published_at` or `created_at`. Videos use the *timestamp* property, then we look to see if the entry was published, if not, then we use its created date.
*Required*

### Manifest
Both Videos and Literature need a way to signal that their content has been updated. The simplest way to do that is to generate a manifest of Video or Literature entries, with a `ver` property calculated using a hash of an entry's data. 

#### Create Manifest Entry
- Convert [[CMS Sanitization#CMS Entry|CMS Entry]] Object into a string, using `JSON.stringfy()`
- Calculate its hash with a hash algorithm (md5, sha1, etc...)
- Create a new Object using the original [[CMS Sanitization#CMS Entry|CMS Entry]] properties and add a `ver` property with the calculated hash.
- Delete *undefined* properties from the Object.
- Return new Object as a *Manifest Entry*.

#### Create Manifest
- Create a [[process#Create Manifest Entry|Manifest Entry]] from each [[CMS Sanitization#CMS Entry|CMS Entry]].
- Consolidate all entries into an Array of Manifest Entries.
- Save entries to a file.
	- *Video Entries Manifest*
		- Folder path should be customizable.
		- File name should be customizable.
		- No dependencies.
		- Manifest will be saved to the specified folder path using the specified file name.
	- *Literature Entries Manifest*
		- Folder path should be customizable.
		- File name must be the same name as the folder path name.
		- **Dependencies**
			- The body of each Manifest Entry will be written to its own file; we call these *Literature Pages*.
			- Each Literature Page will be named after its URI. It will have an `.mdhtml` extension to signify that it contains HTML, rendered from Markdown.
		- Manifest will be saved to the specified folder path, using the folder name as its file name.
		- Literature pages will be saved to the specified folder path.

#### Update Manifest
In order to console log what entries have been added, removed, or updated, we need to do some comparisons. However these comparisons are absolutely irrelevant to updating the Manifest. 

The latest [[CMS Sanitization#CMS Entry|CMS Entry]]'s will go through the [[#Create Manifest|Manifest Creation]] process and will overwrite the existing Manifest, regardless of the comparisons; we only care about the latest data, even if only 1 character was changed. The comparisons are only there to let the developer know the state of the entries.

- Add  Entries
	- For each *id* within the latest [[CMS Sanitization#CMS Entry|CMS Entry]] list, check them against the existing manifest entries.
		- If the *id* is **not** found in the existing manifest entries, then it is a new entry.
- Remove Entries
	- For each *id* within the existing manifest entries, check them against the latest [[CMS Sanitization#CMS Entry|CMS Entry]] list.
		- If the *id* is **not** found in the latest [[CMS Sanitization#CMS Entry|CMS Entry]] list, then that entry has been removed.
- Update Entries
	- Compare each `ver` property from the existing manifest to the latest [[CMS Sanitization#CMS Entry|CMS Entry]].
		- If they **do not** match, then the data has been updated.

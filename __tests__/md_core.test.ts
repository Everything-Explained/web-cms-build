import { useMarkdown } from "../src/services/markdown/md_core";

const md = useMarkdown();


describe('Markdown Expectations', () => {

  it('converts Markdown to HTML', () => {
    const mdString = 'Some text **bolded** and *italisized*.';
    const validOutput = '<p>Some text <strong>bolded</strong> and <em>italisized</em>.</p>\n';
    expect(md.render(mdString)).toBe(validOutput);
  });

  it('converts Markdown links to open in new Tab/Page', () => {
    const mdWithLink = '[link](http://t.est)';
    const validOutput = '<p><a href="http://t.est" target="_blank" rel="noopener">link</a></p>\n';
    expect(md.render(mdWithLink)).toBe(validOutput);
  });

  it('converts links to internal links if applicable', () => {
    const mdWithInternalLink = '[link](/test)';
    const validOutput = '<p><a href="/test" onclick="event.preventDefault(); ' +
                        'window.app.$router.push(\'/test\')">link</a></p>\n';
    expect(md.render(mdWithInternalLink)).toBe(validOutput);
  });

  it('converts video syntax to custom embed', () => {
    const mdWithVideo = '@[youtube](5JqzCjg4YRU)';
    const validVideoEmbedCode =
      `<p><div class="embed-responsive embed-responsive-16by9">` +
      `<iframe class="embed-responsive-item youtube-player" ` +
      `type="text/html" width="auto" height="auto" ` +
      `src="https://www.youtube-nocookie.com/embed/5JqzCjg4YRU?rel=0" ` +
      `frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>` +
      `</iframe></div></p>\n`
    ;
    expect(md.render(mdWithVideo)).toBe(validVideoEmbedCode);
  });

  it('throws error with invalid video syntax', () => {
    const invalidMDVideo = '@[youtube](58712)';
    expect(() => md.render(invalidMDVideo)).toThrow();
  });

  it('should skip processing if video markdown is incomplete', () => {
    expect(() => md.render('@[]')).toThrow();
  });

});
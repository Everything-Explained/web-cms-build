import { useMarkdown } from "../src/services/markdown/md_core";

const md = useMarkdown();


describe('Markdown Renderer', () => {

  it('renders Markdown as HTML', () => {
    const mdString = 'Some text **bolded** and *italisized*.';
    const validOutput = '<p>Some text <strong>bolded</strong> and <em>italisized</em>.</p>\n';
    expect(md.render(mdString)).toBe(validOutput);
  });

  it('renders Markdown links to open in new Tab/Page', () => {
    const mdWithLink = '[link](http://t.est)';
    const validOutput = '<p><a href="http://t.est" target="_blank" rel="noopener">link</a></p>\n';
    expect(md.render(mdWithLink)).toBe(validOutput);
  });

  it('renders internal links to use $router', () => {
    const mdWithInternalLink = '[link](/test)';
    const validOutput = '<p><a href="/test" onclick="event.preventDefault(); ' +
                        'window.$router.push(\'/test\')">link</a></p>\n';
    expect(md.render(mdWithInternalLink)).toBe(validOutput);
  });

  it('renders Video Plugin Syntax to YouTube embed code', () => {
    const mdWithVideo = '@[youtube](5JqzCjg4YRU)';
    const validVideoEmbedCode = `<p><youtube id="5JqzCjg4YRU" /></p>\n`;
    expect(md.render(mdWithVideo)).toBe(validVideoEmbedCode);
  });

  it('throws error with invalid Video ID', () => {
    const invalidMDVideo = '@[youtube](58712)';
    expect(() => md.render(invalidMDVideo)).toThrow();
  });

  it('throws error when Video Plugin Syntax is incomplete', () => {
    expect(() => md.render('@[]')).toThrow();
  });

});
# Commit Syntax
There are many strategies to creating commit messages. 3 main types are minimalist, verbose, and contextual.

- **Minimalist** - This is simply an action followed by a description; no special syntax required, just short and sweet. In a lot of cases, this approach is great, because it ensures the reader knows exactly what the commit is doing...however, you will inevitably lose context in the process of minimization.
	- Let's take the example of `remove obsolete character attributes`. We know immediately what the commit is doing and why it's doing it. The problem is, we don't know "where" it's doing it. 
	- *Character* is a bit of an ambiguous term here, because throughout our code, we could have multiple references to a *Character*, whether that be strings, objects, or logic. 
	- Best case scenario would be to have context for *Character* instead of needing to open the commit and look at the files being changed.
	- Some might say that I'm splitting hairs here, but let's continue...

- **Verbose** - This strategy I wholeheartedly disagree with, because it's information overload in a message that, by its very nature, should be concise and *to-the-point*. Writing, what essentially amounts to a small paragraph, is entirely unnecessary as the main message of a commit. 
	- Let me add that putting a paragraph within the **body** of a commit, has it's use-cases, but it should *not* be the main message itself.
	- Verbosity should be reserved for the body of a commit, and only when it's absolutely necessary to describe some kind of design/engineering issue which would otherwise not be obvious, even from the code.

- **Contextual** - This is the strategy we're going to be using. Not only does it maintain the minimalist philosophy of a commit message, but it also adds a bit of contextual sugar, along with allowing extra content to be laid out in the body of a commit. In order to maintain a more concise structure, we're also limiting what actions are valid.
	- The syntax for this is as follows and notice that we're expounding on the example above: `fix(char_props): remove obsolete attributes`
		- If we're familiar with the code-base at all, we'll immediately know where this change occurred. Even if we're *not* familiar with it, we now know where to look for the change in the code.
		- Notice that we have an even greater context with `fix` as the action, instead of `remove`. The reader may not even know this was a `fix`, it could have just as easily been a `chore`.
	- With this strategy, we define clear actions which convey specific intent and context to our commit; this doesn't always come across using the other strategies.
	- Limiting the actions available, forces a Dev to think about what the commit is supposed to be conveying in a more concise manner. The minimalist approach allows any word to be used as an action, but that can lead to confusion if multiple Devs are using different actions to convey the same idea throughout a project.
	- Last but not least, when commit messages can be read almost like change-logs, we can scrape our `git log` and create a document of changes based on their actions within each of their contexts.
		- The ideas expressed in this document were inspired because of my new git log prettyfier utility: `md_gitlogs`.


## Why?
If we don't unify the way a commit is structured, then we run the risk of "*too many cooks in the kitchen*". Each person is capable of describing a change they've made to the code-base, but they will use their own reasoning about how to do so; this can create confusion.

Having a commit structure already in place, means that any contributors will immediately know how to classify the change they're making.

## Syntax
```
// Bad
action description
description

// Good
action: description
action(subject): description
```
- **action** - should be one of the **allowed** actions listed at the bottom of this document. It's a single word which lets the reader know what's happening: *fix*, *clean*, *feat*, etc... An action like *feat* may not look like an action, but it's referring to the action: *created new feature*. Obviously, it would be silly to type out that whole line, so we just say *feat* for short; it's not the only implicit action.
- **subject** - should be the specific context that the **action** is being applied to. This is usually a *file* or *class* name, but can also be a prolific *concept* or *function* within the code-base.

## Examples
```
// Bad
fix: changed color from yellow to red

// Good
fix: emphasize error text with red
fix: error text should be red
fix: not enough emphasis on error text
```
As you can see from the array of "good" examples, that context is more important than what the code is actually doing. The **why** for a commit should always take precedence over what the code inside a commit is actually doing, unless what a commit is doing, is the context itself.

If we examine all 3 *good* examples, you'll notice that the last one not only fulfills the reason for the fix (emphasizing error text) but also **why** it's a *fix*. From the first 2 *good* examples, it's kind of hard to tell that they are *fixes*, versus just changes to CSS.

- `emphasize error text with red` - Was that the original intent? Is the implication that we're fixing it to fit its original intent, or was the original intent not accurate enough, so we're modifying it further? Is this a fix or a CSS modification? Even though this is a clear and concise description, it leaves us asking too many questions.
- `error text should be red` - Now we know that the text should've been **red** all along, but with a lingering thought of "was it supposed to be *red* all along, or did they just decide that it should've been, after testing?" If this lingering thought is accurate, then it's not actually a fix, it's a CSS modification.
- `not enough emphasis on error text` - With this commit, not only do we know that we're emphasizing text, but also that a lack of emphasis is a problem that wasn't solved with the original intent of the code. The reader may not know that we emphasized it with Red, but that doesn't matter because emphasis is the problem being solved. If we want to see what *"emphasis"* looks like, we can just look at the **code-diff**.

So even if a commit message follows the syntax and basic guidelines, it still may not fully convey its intent. Now obviously, if a commit is marked as a *fix*, we can safely assume that's the intent, but making sure a commit is created with as little ambiguity as possible, is the best case scenario. If I'm only left with one question after reading a commit, it's a good commit.

Of course that question is: "What does the code look like?" because after a good commit, that's the only acceptable unknown.


## Requirements and Restrictions
All commit messages must contain an *action*, followed by a *colon*, followed by a *description*: `action: description`. 

If a commit requires greater context, then an *action* can be supplied with a *subject*, wrapped in *parentheses*, followed by a *colon*, followed by a *description*: `action(subject): description`

> There are no other exceptions to these rules.

**Allowed Actions**
- **feat** - New functionality.
- **fix** - Any kind of fixes, whether issue-related or code-related.
- **chg** - A change that does not fall under any other **allowed** actions. This is an ambiguous action, so only use it if there is **no other relevant option**.
- **clean** - Anything that pertains to clean code practices: refactoring, re-structuring, renaming, reducing/improving logic, whitespace changes, etc...
- **chore** - Something that must be done out of necessity: Updating/fixing/adding/removing deps, moving/deleting files, update version, etc...
- **css** - Cascading Style Sheet changes that are not fixes or new features.

**Deprecated Actions**
- **Add** - falls under "feat"
- **Update/Upd** - falls under "chg"
- **Rename/Refactor** - falls under "clean"
- **Remove** - falls under "clean" or "chore"
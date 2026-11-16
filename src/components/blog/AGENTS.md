# Blog components

- Article submissions (`/blog/write`, `submission.ts`) upload files to the private `blog-submissions` bucket under `<submission id>/`, then insert into `blog_submissions` (status `pending`); visitors can only insert, never read. Why: open to visitors without accounts while drafts stay private until editors review them.

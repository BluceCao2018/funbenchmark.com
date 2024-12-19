import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import { getLocale } from 'next-intl/server';

const postsDirectory = path.join(process.cwd(), 'data', 'md')

export async function getSortedPostsData(type='article') {
  const locale = await getLocale();
  const fileNames = fs.readdirSync(path.join(postsDirectory, locale.toString()))
  var allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, locale+'/'+fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      title: matterResult.data.title,
      description: matterResult.data.description,
      date: matterResult.data.date,
      category: matterResult.data.category,
      thumb: matterResult.data.thumb,
    }
  })
  // filter by type
  if (type) {
    allPostsData = allPostsData.filter(post => post.category && post.category.includes(type))
  }
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export async function getPostData(slug) {
  const locale = await getLocale();
  const fullPath = path.join(postsDirectory, locale+`/${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    slug,
    contentHtml,
    title: matterResult.data.title,
    description: matterResult.data.description,
    date: matterResult.data.date,
    coverImage: matterResult.data.coverImage,
    // ... any other fields you want to include
  };
}

export async function getPostData2(id) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    ...matterResult.data
  }
}


// 读取关于页面内容
export async function getAboutContent(locale) {
  const filePath = path.join(process.cwd(), 'data', 'md', locale, 'about.md');
  
  try {
      const fileContents = await fs.readFileSync(filePath, 'utf8');
      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Use remark to convert markdown into HTML string
      const processedContent = await remark()
          .use(html)
          .process(matterResult.content);
      const contentHtml = processedContent.toString();
      return contentHtml;
          } catch (error) {
              console.error('Error loading about content:', error);
              return null;
          }
}
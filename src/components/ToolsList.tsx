// components/ResourceList.tsx
import React from 'react'; // 确保导入 React
import { Link } from "@/lib/i18n";
import { ExternalLink, ArrowRightIcon } from 'lucide-react'
import {
  Card,
  CardThumb,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Badge } from "@/components/ui/badge";

import { getDataList } from '@/lib/data';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FaLink, FaClock, FaList, FaBullseye, FaHashtag, FaComment, FaQuestion, FaKeyboard, FaPalette, FaEye, FaTrafficLight, FaAdjust, FaHeadphones, FaVolumeUp, FaMusic } from 'react-icons/fa';
import { FaFaceSmile } from 'react-icons/fa6';

// type toolProps = {
//   name: string;
//   description: string;
//   url: string;
//   tags: string[]
// }

type categoryProps = {
  name: string,
  src: string,
  description: string,
  link: string
}

type categoryListProps = {
  categories: categoryProps[]
}


type toolsListProps = {
  category: categoryProps,
  locale: string,
  showMoreLink?: boolean
}

type toolProps = {
  name: string,
  description: string,
  url: string,
  icon_url?: string,
  tags?: string[],
  thumb?: string,
  website?: string,
  icon:string
}

const iconMap: { [key: string]: React.ElementType } = {
  FaClock,
  FaList,
  FaBullseye,
  FaHashtag,
  FaComment,
  FaLink,
  FaQuestion,
  FaKeyboard,
  FaPalette,
  FaEye,
  FaTrafficLight,
  FaAdjust,
  FaHeadphones,
  FaVolumeUp,
  FaMusic,
  FaFaceSmile
};

const ToolsList = ({ category, locale, showMoreLink = true }: toolsListProps) => {
  const t = useTranslations('toolsList');
  const srcList = getDataList(category.src, locale)

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight capitalize">{category.name}</h2>
        {showMoreLink && (
          <Link href={`/category/${category.link}`} className="capitalize text-blue-600 hover:text-blue-800 transition-colors hover:underline">
            {t('more')} <span className='capitalize font-bold'>{category.name}</span> {t('tools')} →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* @ts-ignore */}
        {srcList.slice(0,8).map((resource: toolProps, index) => (
          <Card key={index} className='max-w-sm overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 transition-colors duration-300 group'>
            
            <CardHeader>
              <a 
                href={`${resource.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors inline-flex flex-col items-center"
              >
                <div className='p-2 rounded-md mb-1'>
                  {React.createElement(iconMap[resource.icon] || FaLink, { size: 60, className: "text-blue-600 transition-colors duration-300 group-hover:text-yellow-500" })}
                </div>
                <CardTitle className='capitalize tracking-tighter'>{resource.name}</CardTitle>
                {/* <ExternalLink size={16} className='ml-1' /> */}
              </a>
              <CardDescription className='flex flex-col justify-center text-center items-center text-gray-700 dark:text-gray-400 text-lg '>
                {/* <div className='flex flex-col h-[60px] line-clamp-3 mt-1 tracking-tight text-start text-gray-800 dark:text-white text-lg items-center'> */}
                  {resource.description}
                {/* </div> */}
                    
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

const ToolsPage = ({ category, locale }: { category: categoryProps, locale: string }) => {
  const srcList = getDataList(category.src, locale);

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* @ts-ignore */}
        {srcList.slice(0,8).map((resource: toolProps, index) => (
          <Card key={index} className='max-w-sm overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 transition-colors duration-300 group'>
            
            <CardHeader>
              <a 
                href={`${resource.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors inline-flex flex-col items-center"
              >
                <div className='p-2 rounded-md mb-1'>
                  {React.createElement(iconMap[resource.icon] || FaLink, { size: 60, className: "text-blue-600 transition-colors duration-300 group-hover:text-yellow-500" })}
                </div>
                <CardTitle className='capitalize tracking-tighter'>{resource.name}</CardTitle>
                {/* <ExternalLink size={16} className='ml-1' /> */}
              </a>
              <CardDescription className='flex flex-col justify-between '>
                <div className='h-[60px] line-clamp-3 mt-1 tracking-tight text-start'>
                  {resource.description}
                </div>
                { resource.tags ? 
                  <div className='mt-3'>
                    {resource.tags.slice(0,3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className='text-xs pb-1 mr-1 mt-2 tracking-tighter'>{tag}</Badge>
                    ))}
                  </div> :
                 null
                }     
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

type searchPageProps = {
  searchData: toolProps[]
}

const SearchPage = ({ searchData }: searchPageProps) => {

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* @ts-ignore */}
        {searchData.slice(0,8).map((resource: toolProps, index) => (
          <Card key={index} className='max-w-sm overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 transition-colors duration-300 group'>
            
            <CardHeader>
              <a 
                href={`${resource.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-colors inline-flex flex-col items-center"
              >
                <div className='p-2 rounded-md mb-1'>
                  {React.createElement(iconMap[resource.icon] || FaLink, { size: 60, className: "text-blue-600 transition-colors duration-300 group-hover:text-yellow-500" })}
                </div>
                <CardTitle className='capitalize tracking-tighter'>{resource.name}</CardTitle>
                {/* <ExternalLink size={16} className='ml-1' /> */}
              </a>
              <CardDescription className='flex flex-col justify-between '>
                <div className='h-[60px] line-clamp-3 mt-1 tracking-tight text-start'>
                  {resource.description}
                </div>
                { resource.tags ? 
                  <div className='mt-3'>
                    {resource.tags.slice(0,3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className='text-xs pb-1 mr-1 mt-2 tracking-tighter'>{tag}</Badge>
                    ))}
                  </div> :
                 null
                }     
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}


const CategoryList = ({ categories }: categoryListProps) => {

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* @ts-ignore */}
        {categories.map((category: categoryProps, index) => (
          <Card key={index} className='max-w-sm overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 transition-colors duration-300 hover:bg-gray-100'>
            <CardHeader>
              <a 
                href={`/category/${category.link}`}
                className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <CardTitle className='capitalize'>{category.name}</CardTitle>
                <ArrowRightIcon size={16} className='ml-2'/>
              </a>
              <CardDescription className='flex flex-col justify-between'>
                <div className='h-[40px] line-clamp-2 mt-4 tracking-tight text-start'>
                {category.description}
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

export { ToolsList, ToolsPage, CategoryList, SearchPage };
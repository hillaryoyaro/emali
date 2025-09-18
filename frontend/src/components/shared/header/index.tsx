import { APP_NAME } from '@/src/lib/constants'
import Image from 'next/image'
import Link from 'next/link'

import Menu from './menu'
import SearchBar from './search/searchBar'
//import SearchBar from './search/search'
import data from '@/src/lib/data'

import Sidebar from './sidebar'
import { getAllCategories } from '@/src/lib/actions/product.actions'




export default async function Header() {
  const categories = await getAllCategories()
  return (
    <header className='text-white'style={{ backgroundColor: ' #023430' }} >
      <div className='px-2'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <Link
              href='/'
              className='flex items-center header-button font-extrabold text-2xl m-1 '
            >
              <Image
                src='/icons/logo.svg'
                width={100}
                height={100}
                alt={`${APP_NAME} logo`}
              />
             
            </Link>
          </div>

          <div className='hidden md:block flex-1 max-w-xl'>
            <SearchBar />
          </div>
          <Menu />
        </div>
        <div className='md:hidden block py-2'>
          <SearchBar />
        </div>
      </div>
      <div className=' text-white flex items-center px-3 mb-[1px] 'style={{ backgroundColor: ' #00593F' }} >
      <Sidebar categories={categories} />
        <div className='flex items-center flex-wrap gap-3 overflow-hidden   max-h-[42px]'>
          {data.headerMenus.map((menu) => (
            <Link
              href={menu.href}
              key={menu.href}
              className='header-button !p-2 '
            >
              {menu.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
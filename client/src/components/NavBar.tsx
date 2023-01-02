import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link'
import React from 'react'
import { FaSearch } from 'react-icons/fa';
import { useAuthState, useAuthDispatch } from '../context/auth'

const NavBar: React.FC = () => {
    const {loading, authenticated} = useAuthState();

    const dispatch = useAuthDispatch();

    const handleLogout = () => {
        axios.post("/auth/logout")
        .then(()=>{
            dispatch("LOGOUT");
            window.location.reload();
        })
        .catch((err) => {
            console.log(err);
        })
    }

  return (
    <div className='fixed inset-x-0 top-0 z-10 flex items-center justify-between h-13 px-5 bg-white'>
        <span className='text-2xl font-semibold text-gray-400'>
            <Link href="/">
                <a>
                    <Image
                        src="/pinkbeen.png"
                        alt="logo"
                        width={80}
                        height={45}
                    >
                    </Image>
                </a>
            </Link>
        </span>

        <div className="max-w-full px-4"> 
            <div className='relative flex items-center bg-gray-100 border rounded hover:border-gray-700 herver:bg-white'>
                {/* fontawsome에서 제공하는 돋보기 아이콘 입니다 <i className='pl-4 pr-3 text-gray-400 fas fa-search'></i> */}
                <FaSearch className='ml-2 text-gray-400'></FaSearch>
                <input type="text" placeholder='Search Reddit' className='px-3 py-1 h-7 bg-transparent rounded focus:outline-none'>
                </input>
            </div>
        </div>

        <div className='flex'>
            {!loading && 
                (authenticated ? (
                    <button className='w-20 px-2 mr-2 h-7 text-sm text-center text-white bg-gray-400 rounded'
                    onClick={handleLogout}>LOGOUT</button>
                    ):(
                    // <Fragment>
                    <>
                    <Link href="/login">
                        <a className='w-20 px-2 pt-1 mr-2 h-7 text-sm text-center text-blue-500 border border-blue-500 rounded'>
                            LOG IN
                        </a>
                    </Link>
                    <Link href="/register">
                        <a className='w-20 px-2 pt-1 mr-2 h-7 text-sm text-center text-white border bg-gray-400 rounded'>
                            SIGN UP
                        </a>
                    </Link>
                    </>
                    // </Fragment>
            ))}
        </div>
    </div>
  )
}

export default NavBar;
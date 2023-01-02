import axios from 'axios'
import Image from 'next/image';
import cls from 'classnames'
import { useRouter } from 'next/router';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { useAuthState } from '../../context/auth';
import SideBar from '../../components/SideBar';
import { Post } from '../../types';
import PostCard from '../../components/PostCard';
/**
 * 커뮤니티(Sub) 상세 페이지
 * 동적경로로 페이지를 갖고오기위해 [sub].tsx로 생성
 * @returns 
 */
const SubPage = () => {
    console.log("[sub].ts")
    const fetcher = async (url: string) =>{
        try {
            const res = await axios.get(url);
            return res.data
        } catch (error:any) {
           throw error.response.data; 
        }
    }
    
    const router = useRouter();
    const subName = router.query.sub; // 이게 [sub].tsx 에서 sub
    const {data: sub, error, mutate} = useSWR( subName? `/subs/${subName}`: null,fetcher)
    console.log("sub", sub)

    /**
     * useRef : React에서 특정 Dom 을 선택할 때, ref 를 생성해서, DOM을 선택함
     * DOM을 선택하기 위해 사용한다고 보면됨!
     * => Dom 을 직접 선택해야 할 경우들
     *  1. 엘리먼트 크기를 가져와야 할 때
     *  2. 스크롤바 위치르 가져와야 할 때
     *  3. 엘리먼트에 포커스를 설정 해줘야 할 때 등등등
     */
    const fileInputRef = useRef<HTMLInputElement>(null); // 초기값 null

    // 자신의 sub일 때만, 조작 가능한 기능을 처리하기위해(배너, 이미지 변경)
    const [ownSub, setOwnSub] = useState(false);
    const { authenticated, user } = useAuthState();
    useEffect(()=>{
        if(!sub || !user) return;
        setOwnSub(authenticated && user.username === sub.username);
    }, [sub]); 

    const openFileInput = (type: string) => {
        if(!ownSub) return;
        //fileInputRef.current : 현재 선택 된, DOM 이 들어가있음!
        const fileInput = fileInputRef.current; 
        if(fileInput){
            fileInput.name = type;
            fileInput.click();
        }
    }  

    const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
        if(event.target.files === null) return;
        const file = event.target.files[0];

        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", fileInputRef.current!.name);

        try{
            await axios.post(`/subs/${sub.name}/upload`, formData, {
                headers:{ "Context-Type":"multipart/form-data"},
            })
        }catch (error:any){
            console.log(error);
        }
    }

    let renderPosts;
    if(!sub) {
        renderPosts = <p className='text-lg text-center'> 로딩중 </p>
    }else if( sub.posts.length === 0 ){
        renderPosts = <p className='text-lg text-center'> 아직 작성된 포스트가 없습니다.</p>
    } else {
        renderPosts = sub.posts.map((post: Post) => (
            <PostCard key={post.identifier} post={post} subMutate={mutate}/>
        ))
    }
    // 리액트는 컴포넌트 최상단을 감싸줘야함<React.Fragment>(fragment) or div 
  return (
  <>
    {sub &&
    <React.Fragment>
        <div>
            {/* 배너 이미지 */}
            <input type="file"
                hidden={true}
                ref={fileInputRef}
                onChange={uploadImage}
            />
            <div className='bg-gray-400'>
                {sub.bannerUrl? (
                    <div className='h-56'
                        style={{
                            backgroundImage:`url(${sub.bannerUrl})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize:'cover',
                            backgroundPosition:'center'
                        }}
                        onClick={()=> openFileInput("banner")}
                        >
                    </div>
                ):(
                    <div className='h-20 bg-gray-400'
                         onClick={()=> openFileInput("banner")}></div>
                )}
            </div>
            {/* 커뮤니티 메타데이터 */}
            <div className='h-20 bg-white'>
                <div className='relative flex max-w-5xl px-5 mx-auto'>
                    <div className='absolute' style={{top:-15}}>
                        {sub.imageUrl && (
                            // <Image src={sub.imageUrl} alt="커뮤니티 이미지" width={70} height={70} className="rounded-full"/>
                            <Image 
                                src={sub.imageUrl} alt="" width={70} height={70} 
                                onClick={()=>openFileInput("image")}
                                className="rounded-full"/>
                        )}
                    </div>
                    <div className='pt-1 pl-24'>
                        <div className='flex items-center'>
                            <h1 className='text-3xl font-bold'>{sub.title}</h1>
                        </div>
                        <p className='text-small font-bold text-gray-400'>
                        /r/{sub.name}
                        </p>
                    </div>
                </div>
            </div> 
        </div>
          {/* 포스트와 사이드바 */}
          <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
            <div className='w-full md:mr-3 md:w-8/12'> {renderPosts}</div>
            <SideBar sub={sub} />
          </div>
    </React.Fragment>
    }
    </>
  )
}

export default SubPage
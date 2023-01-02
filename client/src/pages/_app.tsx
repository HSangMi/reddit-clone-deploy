import '../styles/globals.css'
import type { AppProps } from 'next/app'
import axios from 'axios'
import { AuthProvider } from '../context/auth';
import { useRouter } from 'next/router';
import path from 'path';
import NavBar from '../components/NavBar';
import { SWRConfig } from 'swr';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {

  // BASE URL을 최상단 컴포넌트에서 환경변수로 설정해둠
  // nextjs는 환경변수는 `NEXT_PUBLIC`로 시작해야함
  // client 폴더 최상단에 .env 파일만들어서 `NEXT_PUBLIC_SERVER_BASE_URL` 지정. 
  // env파일에 설정값을 넣는 이유는, git에 올라가지 않기 위함!
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + '/api';
  // axios 모든 요청을 날릴 때, 아래 옵션을 true로!
  axios.defaults.withCredentials = true;

  // 사용자 인증 전 페이지 일 경우
  const { pathname } = useRouter();
  const authRoutes = ["/register", "login"];
  const authRoute = authRoutes.includes(pathname);

  // return <Component {...pageProps} />

  // user정보를 context에서 사용하기 위에, value에 userInfo를 넣고, Provider로 감싸줘야하지만,
  // return <StateContext.Provider value={userInfo}>
  //   <Component {...pageProps} />
  //   </StateContext.Provider>

  const fetcher = async (url: string) =>{
    try {
        const res = await axios.get(url);
        return res.data;
    } catch (error:any) {
        throw error.response.data;
    }
}


  // authProvider 함수를 생성하여, 처리해줌! {childern}은 Component가 됨
  return <>
    <Head>
      <script defer src="https://use.fontawesome.com/releases/v6.1.1/js/all.js" integrity="sha384-xBXmu0dk1bEoiwd71wOonQLyH+VpgR1XcDH3rtxrLww5ajNTuMvBdL5SOiFZnNdp" crossOrigin="anonymous"></script>
      {/* 폰트어썸 cnd 추가!! */}
    </Head>
    <SWRConfig
      value={{fetcher}}
    >
    <AuthProvider>
      {!authRoute && <NavBar />}
      <div className={authRoute ? "":"pt-12 bg-gray-200 min-h-screen"}>
        <Component {...pageProps}/>
      </div>
    </AuthProvider>
    </SWRConfig>
    </>
}

export default MyApp

import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'
import InputGroup from '../components/InputGroup'
import { useAuthState } from '../context/auth';
// import 할 때, import { xxx } from XXX와, import xxx from XXX의 차이
// import { xxx } from XXX : XXX의 여러모듈 중 하나
// import xxx from XXX : exprot default module로 익스포트한경우

const Register = () => {
    //state 생성
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({}); // type은 any로
    const {authenticated } = useAuthState();


    let router = useRouter(); // next 에서 제공하는 라우터

    if(authenticated) router.push("/");



    // 비동기 요청을 위한 async - await
    const handleSubmit = async (event:FormEvent) =>{
        // submit이벤트가 발생했을때 원래동작(refresh 하는것)을 막아줌
        event.preventDefault();
        console.log(' 오잉?');

 
        // 비동기 요청을 할 때는 try catch로 묶어주는 게 좋음
        try {
            const res = await axios.post('/auth/register',{
                email: email, // js 에서 key와 value가 똑같으면, password처럼 한개만 써도 됨
                password,
                username
            })
            console.log('res', res);
            alert('성공');
            // 원하는경로 '/login'로 push
            router.push('/login'); 
            
        } catch (error: any) { // typescript error가 날떄 가장 간단한 처리방법! type을 any로 지정해줌
            console.log('error', error);
            setErrors((error.response.data || {}))
            
        }

    }

  return (
    <div className='bg-white'>
        <div className='flex flex-col items-center justify-content h-screan p-6'>
            <div className='w-10/12 mx-auto md:w-96'>
                <h1 className='mb-2 text-lg font-medium'>회원가입</h1>
                <form onSubmit={handleSubmit}>
                    <InputGroup 
                        placeholder='Email'
                        value={email}
                        setValue={setEmail}
                        error={errors.email}
                    />
                    <InputGroup 
                        placeholder='Username'
                        value={username}
                        setValue={setUsername}
                        error={errors.username}
                    />                    
                    <InputGroup 
                    placeholder='Password'
                    value={password}
                    setValue={setPassword}
                    error={errors.password}
                />
                    <button className='w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded'>
                    회원 가입
                    </button>
                </form>
                <small>
                    이미 가입하셨나요?
                    <Link href="/login"> 
                        <a className='ml-1 text-blue-500 uppercase'>로그인</a>
                    </Link>

                </small>
          
            </div>


        </div>
    </div>
  )
}

export default Register
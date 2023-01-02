import Axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import InputGroup from "../components/InputGroup";
import { useAuthState, userAuthDispatch } from "../context/auth";

const Login = () =>{
    let router = useRouter();
    // state생성
    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");
    const[errors, setErrors] = useState<any>({});
    const { authenticated } = useAuthState();
    const dispatch = userAuthDispatch();

    if(authenticated) router.push("/");

    // handelSubmit 함수 생성
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        try {
            const res = await Axios.post(
                "/auth/login",
                {
                    password,
                    username,
                },{
                    withCredentials: true,
                    /*
                        로그인 성공 시, token정보를 쿠키에 저장하는데, 
                        프론트와 백엔드의 주소가 다른경우 ,별다른 에러도 없이 인증이 이루어지지 않음!
                        도메인 주소가 다르면 쿠키가 전송되지 않기때문! 
                        => 프론트에서는 axios요청때, withCrendentials 설정,
                        => 백엔드에서는 cors부분에 credentials true 설정을 해서 해결(ResponseHeader에 Access-Control-Allow-Credentials을 설정)
                    */
                }
            );


            dispatch("LOGIN", res.data?.user);

            router.push("/");

        } catch (error : any) {
            console.error(error);
            setErrors(error?.response?.data || {});
        }
    }

    return (
        <div className="bg-white">
            <div className="flex flex-col items-center justify-center h-screen p-6">
                <div className="w-10/12 mx-auto md:w-96">
                    <h1 className="mb-2 text-lg font-medium">로그인</h1>
                    <form onSubmit={handleSubmit}>
                        <InputGroup
                            placeholder="Username"
                            value={username}
                            setValue={setUsername}
                            error={errors.username}
                        />
                        <InputGroup
                            placeholder="Password"
                            value={password}
                            setValue={setPassword}
                            error={errors.password}
                        />
                        <button className={`w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gray-400 rounded`}>
                            로그인
                        </button>
                    </form>
                    <small>
                        아직 아이디가 없나요?
                        <Link href={'/register'}>
                            <a className="ml-1 text-blue-500 uppercase">회원가입</a>
                        </Link>
                    </small>
                </div>
            </div>
        </div>
    )
}



export default Login
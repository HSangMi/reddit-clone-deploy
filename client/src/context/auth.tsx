import axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import { User } from "../types";

interface State{
    authenticated: boolean;
    user: User | undefined;
    loading: boolean;
}

// 컴포넌트 별 state를 관리하기 위해, 다양할 라이브러리(redux,,)가 있지만,
// 여기서는 react의 컴포넌트를 가져와서 쓸거임!
// user정보를 담을 컨텍스트
const StateContext = createContext<State>({
    authenticated: false,
    user: undefined,
    loading: true
})

// userState를 업데이트할 때 필요한 state
// 유저정보를 업데이트 하거나, 인증 유뮤를 업데이트하는것을 구현
const DispatchContext = createContext<any>(null);



interface Action{
    type: string;
    payload: any;
}

const reducer = (state: State, {type,payload}:Action) =>{
                // 리턴할 인자, 초기값(처리할 value)
    switch(type) {
        case "LOGIN" : 
            return {
                ...state, // 원래있던 state를 가져오고
                authenticated: true,
                user: payload
            }
        case "LOGOUT" : 
            return {
                ...state, 
                authenticated: false,
                user: null
            }
        case "STOP_LOADING" : 
            return {
                ...state, 
                loading: false
            }
        default:
            throw new Error(`Unknown action type : ${type}`)

    }

}

// context에 있는 value를 다른 컴포넌트에서 사용할 수 있기 위해서는 ContextProvider로 감싸줘야한다
// 여러가지 방법이 있지만, 우리는 authProvider함수를 생성하고 이걸로 감싸줄거임
export const AuthProvider = ({children}:{/*type*/children: React.ReactNode}) => {

    const [state, defaultDispatch] = useReducer(reducer, {
        user: null,
        authenticated: false,
        loading : true
    })

    console.log('state', state);

    const dispatch = (type: string, payload?: any) =>{
        defaultDispatch({type, payload})
    }

    // userEffect : 컴포넌트가 mount되자마자 실행!
    useEffect(()=>{
        async function loadUser(){
            try{
                const res = await axios.get("/auth/me");
                // 백엔드에서 전달받은 user 정보를 리액트 context에 유저정보 세팅
                dispatch("LOGIN", res.data);
            }catch(error){
                console.log(error)
            }finally{
                dispatch("STOP_LOADING");
            }
        }
        loadUser();
      
    }, [])

    return (
        // userState를 업데이트 하기위해, dispatch로 감쌈
            // 위에 생성한 context에 있는 provider사용)
        <DispatchContext.Provider value={dispatch}>
            <StateContext.Provider value={state}>{children}</StateContext.Provider>
        </DispatchContext.Provider>
    )
}


/**
 * useReduce (내장함수)
 * useState의 대체 함수 ->  state 생성, 업데이트 가능 
 * 로직이 복잡해 질 경우 , 값을 컨트롤 하는 로직은 reduce함수 쪽으로 분리
 * 
 */

export const useAuthState = () => useContext(StateContext);
export const userAuthDispatch = () => useContext(DispatchContext);


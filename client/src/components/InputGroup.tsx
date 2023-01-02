import React from 'react'
import cls from 'classnames'

// interface : typescrijpt에서 제공하는건가?
// ? : 필수 파리미터 아닌것, 들어올수도있고, 안들어올수도었는 property
interface InpuGroupProps{
    className?: string;
    type?: string;
    placeholder?: string;
    value: string;
    error: string | undefined;  // string 아니면 undefined 처리
    setValue: (str: string) => void;  // 리턴은 없음
}

const InputGroup: React.FC<InpuGroupProps> = ({
    // inputGroup 디폴트값 설정
    className='mb-2', // 값이 안넘어왔을떄, 설정할값
    type="text",
    placeholder="",
    error,
    value,
    setValue
}) => {
  return (
    <div className={className}>
        <input 
            type={type} 
            style={{minWidth:300, padding:5}}
            className={cls(`w-full p-3 transition duration-200 border border-gray-400 rounded bg-gray-50 focus:bg-white hover:bg-white`,
                {'border-red-500':error}
            )}
            placeholder={placeholder}
            value={value}
            onChange={(e)=>setValue(e.target.value)}
        />
        <small className='font-medium text-red-500'>{error}</small>
    </div>
  )
}

export default InputGroup
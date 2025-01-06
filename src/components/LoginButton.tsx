import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

const LoginButton = () => {
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);

  const handleSuccess = (credentialResponse: any) => {
    const decoded = jwtDecode<GoogleUserInfo>(credentialResponse.credential);
    setUserInfo(decoded);
    console.log('登录成功:', decoded);
  };

  const handleError = () => {
    console.log('登录失败');
  };

  return (
    <div className="login-button-container">
      {userInfo ? (
        <img 
          src={userInfo.picture}
          alt={userInfo.name}
          className="rounded-full w-10 h-10"
          title={userInfo.name}
        />
      ) : (
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          type="icon"
          theme="filled_blue"
          shape="circle"
          size="medium"
        />
      )}
    </div>
  );
};

export default LoginButton; 
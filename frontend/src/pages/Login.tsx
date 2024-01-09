import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { login, useAuth, useAuthDispatch } from "../utils/auth.tsx";
import { useHistory, useLocation } from "react-router-dom";
import { Request } from '../utils/requests.tsx';


export const Login: FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<Error | undefined>();

  const [loginRequest, setLoginRequest] = useState<Request | undefined>();

  const state = useAuth();
  const dispatch = useAuthDispatch();
  const history = useHistory();
  const location = useLocation<any>();
  const { from } = location.state || { from: { pathname: '/' } };

  useEffect(() => {
    return () => {
      loginRequest?.abort();
    }
  });

  useEffect(() => {
    if (state.token)
      history.replace(from);
  }, [state])

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.currentTarget.value.trim());
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value.trim());
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    const { request, response } = login(username, password);
    setLoginRequest(request);

    try {
      const token = await response;
      dispatch!({
        type: 'login',
        token
      });
      history.replace(from);
    } catch (e: any) {
      // Checking if this is an HTTP error
      if (e.status && e.response) {
        if (e.status === 401) {
          e.message = 'Access denied'
        }
        setError(e);
      }
      console.warn(e)
    }
  }


  return (
    <div className="container">
      <div className="row text-left h-100 main">
        <div className="col-sm-12 border rounded">
          <h1 className="text-center">Login</h1>
          { error && <p className="error-message">{ error.message }</p> }
          <form onSubmit={ handleSubmit }>
            <div className="form-group">
              <label htmlFor="loginInput">Login</label>
              <input id="loginInput" className="form-control" type="text"
                     value={ username }
                     onChange={ handleUsernameChange }/>
            </div>
            <div className="form-group">
              <label htmlFor="passwordInput">Password</label>
              <input id="passwordInput" className="form-control" type="password"
                     value={ password }
                     onChange={ handlePasswordChange }/>
            </div>
            <input className="btn btn-primary" type="submit" value="Submit"/>
          </form>
        </div>
      </div>
      <a href="/..">Back to main site</a>
    </div>
  )
}


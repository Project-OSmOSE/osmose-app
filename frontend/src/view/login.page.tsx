import { ChangeEvent, FC, FormEvent, useCallback, useEffect, useState } from 'react';
import {Link, useHistory, useLocation} from "react-router-dom";
import { useAuthService } from "../services/auth";
import { buildErrorMessage } from "../services/annotator/format/format.util";

export const Login: FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | undefined>();

  const auth = useAuthService();
  const history = useHistory();
  const location = useLocation<any>();
  const { from } = location.state || { from: { pathname: '/annotation-campaigns' } };

  useEffect(() => {
    if (auth.isConnected()) history.replace(from);

    // Abort calls on view leave
    return () => auth.abort();
  }, []);

  useCallback(() => {
    if (auth.isConnected()) history.replace(from);
  }, [auth.bearer]);

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUsername(event.currentTarget.value.trim());
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value.trim());
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) return setError('You must enter your login and password');
    setError(undefined);

    try {
      await auth.login(username, password);
      history.replace(from);
    } catch (e: any) {
      setError(buildErrorMessage(e));
    }
  }

  return (
      <div className="container">
        <div className="row text-left h-100 main">
          <div className="col-sm-12 border rounded">
            <h1 className="text-center">Login</h1>
            { error && <p className="error-message">{ error }</p> }
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
              <input className="btn btn-primary"
                     type="submit"
                     value="Submit"/>
            </form>
          </div>
        </div>
        <Link to="/">Back to Home</Link>
      </div>
  )
}

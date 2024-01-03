import { ChangeEvent, FC, FormEvent, useEffect, useState } from 'react';
import { AuthService } from './services/AuthService';


export const Login: FC = () => {
  const [login, setLogin] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    return function unmount() {
      AuthService.shared.abortLogin();
    }
  })

  const handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLogin(event.currentTarget.value.trim());
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value.trim());
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    AuthService.shared.login(login, password)
      .catch(err => {
        // Checking if this is an HTTP error
        if (err.status && err.response) {
          if (err.status === 401) {
            err.message = 'Access denied'
          }
          setError(err);
        } else {
          throw err
        }
      })
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
                     value={ login }
                     onChange={ handleLoginChange }/>
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


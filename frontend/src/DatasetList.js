// @flow
import React, { Component } from 'react';
import request from 'superagent';

const GET_DATASET_API_URL = '/api/dataset/';
const IMPORT_DATASET_API_URL = '/api/dataset/datawork_import/';

type DatasetListProps = {
  app_token: string
};
type DatasetListState = {
  datasets: Array<{
    id: number,
    name: string,
    type: string,
    files_type: string,
    files_count: number,
    start_date: string,
    end_date: string
  }>,
  error: ?{
    status: number,
    message: string
  },
  success: string
};
class DatasetList extends Component<DatasetListProps, DatasetListState> {
  state = {
    datasets: [],
    error: null,
    success: ''
  }
  getData = request.get(GET_DATASET_API_URL)
  startImport = request.get(IMPORT_DATASET_API_URL)

  componentDidMount() {
    return this.getData.set('Authorization', 'Bearer ' + this.props.app_token).then(req => {
      this.setState({
        datasets: req.body
      });
    }).catch(err => {
      if (err.status && err.status === 401) {
        // Server returned 401 which means token was revoked
        document.cookie = 'token=;max-age=0';
        window.location.reload();
      }
      this.setState({
        error: err
      });
    });
  }

  componentWillUnmount() {
    this.getData.abort();
    this.startImport.abort();
  }

  import = () => {
    return this.startImport.set('Authorization', 'Bearer ' + this.props.app_token).then(req => {
        this.setState({
          success: 'Import in progress',
        });
    }).catch(err => {
      if (err.status && err.status === 401) {
        // Server returned 401 which means token was revoked
        document.cookie = 'token=;max-age=0';
        window.location.reload();
      }
      this.setState({
        error: err
      });
    });
  }

  render() {
    const datasets = this.state.datasets.map(dataset => {
      return (
        <tr key={dataset.id}>
          <td>{dataset.name}</td>
          <td>{dataset.type}</td>
          <td>{dataset.files_type}</td>
          <td>{dataset.files_count}</td>
          <td>{new Date(dataset.start_date).toDateString()}</td>
          <td>{new Date(dataset.end_date).toDateString()}</td></tr>
      );
    });

    if(this.state.error) {
      return (
        <div className="col-sm-9 border rounded">
          <h1>Datasets</h1>
          <p className="error-message">{this.state.error.message}</p>
        </div>
      )
    }

    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Datasets</h1>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>File type</th>
              <th>Number of files</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {datasets}
          </tbody>
        </table>
        <p className="text-center">
          <button className="btn btn-primary" onClick={this.import}>Import</button>
        </p>
      </div>
    )
  }
}

export default DatasetList;

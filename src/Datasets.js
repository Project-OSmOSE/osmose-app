import React, { Component } from 'react';
import request from 'superagent';

class Datasets extends Component {
  state = {
    datasets: []
  }
  getData = request.get(process.env.REACT_APP_API_URL + '/dataset/list')

  componentDidMount() {
    if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
    return this.getData.then(req => {
      this.setState({
        datasets: req.body
      })
    }).catch(err => {
      this.setState({
        error: err
      })
    });
  }

  componentWillUnmount() {
    this.getData.abort();
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
      </div>
    )
  }
}

export default Datasets;

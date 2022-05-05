import React, { useState, useEffect, Component } from "react";
import Spinner from '../components/Spinner';
import { Map, GoogleApiWrapper, InfoWindow, Marker } from 'google-maps-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, Line,Bar } from 'react-chartjs-2';
import Chart from "chart.js/auto";
import data from '../data.json';
import { Modal, Button } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';

const mapStyles = {
    width: '100%',
    height: '100%'
};
export class MapContainer extends Component {

    constructor(props) {
        super(props);
        this.chartReference = React.createRef();
        this.state = {
            initialCenter: null,
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {},
            locationData: {},
            showDetails: false,
            pieData: {},
            showOtherDetails: false,
            showNDetails: false,
            bgcolors: [],
            compareValues: [],
            nutrientsData: {},
            linegraphData: {},
            compareNutrientsData: [],
            plots: ['soc_in_percent', 'moisture_in_percent', 'env_humidity_in_percent', 'n_total_in_percent'],
            nutrientsList: ['nmin_in_mg_per_100g', 'p_in_mg_per_100g', 'k_in_mg_per_100g', 'mg_in_mg_per_100g', 'no3_mg_per_100g', 'so4_mg_per_100g', 'p2o5_in_mg_per_100g', 'k2o_in_mg_per_100g'],

        }
    }

    componentDidMount() {
        this.setState({
            initialCenter:
            {
                lat: data[0].geometry.coordinates[1],
                lng: data[0].geometry.coordinates[0]
            }
        });
        var bgColors = data.map(jsonData => `rgba(${this.randowColor()}, ${this.randowColor()}, ${this.randowColor()}, 0.8)`);
        this.setState({ bgcolors: bgColors });
    }

    randowColor() {
        return Math.floor(Math.random() * 255) + 1;
    }

    onMarkerClick = (props, marker, e) => {
        var pieData = this.state.pieData;

        //Computer other data

        var compareValues = this.state.plots.map(label => {
            var plotValues = [];
            var farmID = [];
            for (var d in data) {
                const innerData = data[d];
                if (innerData[label] != undefined) {
                    plotValues.push(innerData[label]);
                    farmID.push("Point #" + innerData["id"]);
                }
            }

            return {
                labels: farmID,
                datasets: [
                    {
                        label: 'Percentage Value :',
                        data: plotValues,
                        backgroundColor: this.state.bgcolors
                    },
                ],
            }
        });
        this.setState({ compareValues: compareValues });


        var comparenutrientsData = this.state.nutrientsList.map(label => {
            var plotValues = [];
            var farmID = [];
            for (var d in data) {
                const innerData = data[d];
                if (innerData[label] != undefined) {
                    plotValues.push((innerData[label] == null) ? 0 : innerData[label]);
                    farmID.push("Point #" + innerData["id"]);
                }
            }
            return {
                labels: farmID,
                datasets: [
                    {
                        label: ' ',
                        data: plotValues,
                        backgroundColor: this.state.bgcolors
                    },
                ],
            }
        });
        this.setState({ compareNutrientsData: comparenutrientsData });

        var labels = this.state.nutrientsList;
        var points = data.map(point => "Point #" + point.id);

        var lineData = labels.map((label, index) => {
            var plotValues = [];
            for (var d in data) {
                const innerData = data[d];
                if (innerData[labels[index]] == undefined)
                    plotValues.push(0);
                else
                    plotValues.push((innerData[labels[index]] != null) ? innerData[labels[index]] : 0);
            }

            return {
                "label": label.split("_")[0],
                "data": plotValues,
                "borderColor": "rgb(255, 99, 132)",
                "backgroundColor": `rgba(${this.randowColor()}, ${this.randowColor()}, ${this.randowColor()}, 0.8)`,
                "yAxisID": "y"
            }
        });

        var linegraphData =
            { "labels": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5", "Point 6", "Point 7"], "datasets": lineData };

        this.setState({ linegraphData: linegraphData });


        //nutrients Plot List
        var nutrientsList = this.state.nutrientsList.map(nutrient => props.data[nutrient]);

        this.setState({
            locationData: props.data,
            showDetails: true,
            pieData: {
                labels: this.state.plots,
                datasets: [
                    {
                        label: 'Percentage Value :',
                        data: [
                            props.data.soc_in_percent,
                            props.data.moisture_in_percent,
                            props.data.env_humidity_in_percent,
                            props.data.n_total_in_percent],
                        backgroundColor: this.state.bgcolors
                    },
                ],
            },
            nutrientsData: {
                labels: this.state.nutrientsList.map(n => n.split("_")[0]),
                datasets: [
                    {
                        label: ' ',
                        data: nutrientsList,
                        backgroundColor: this.state.bgcolors
                    },
                ],
            }
        }, () => this.setState({ showDetails: true }));
    }

    render() {
        const { nutrientsList, compareNutrientsData,
            initialCenter, pieData, showNDetails, showDetails,
            showOtherDetails, compareValues, plots, nutrientsData,
            linegraphData } = this.state;
        return (
            <>
                {(initialCenter == null) ?
                    <center><Spinner bg="#fff" fill="#222" /></center> :
                    <Map
                        google={this.props.google}
                        zoom={14}
                        style={mapStyles}
                        initialCenter={initialCenter}
                    >
                        {data.map(report => {
                            return <Marker
                                title={report.model_ref}
                                data={report}
                                onClick={this.onMarkerClick}
                                position={{
                                    lat: report.geometry.coordinates[1],
                                    lng: report.geometry.coordinates[0]
                                }} />
                        })}
                    </Map>}
                <Modal
                    size="lg"
                    show={showDetails} onHide={() => this.setState({ showDetails: false })}>
                    <Modal.Header closeButton>
                        <Modal.Title>Point Analysis</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-6">
                                <h5>{this.state.locationData.model_ref}</h5>
                                Group ID : {this.state.locationData.group_id}

                                <br /><strong><small>Texture</small> : {this.state.locationData.texture}</strong>
                                <br /><strong><small>Soil PH </small> : {this.state.locationData.ph}</strong>
                                <br /><strong><small>Soil Moisture </small> : {this.state.locationData.moisture_in_percent}%</strong>
                            </div>
                            <div className="col-12"></div>
                            <div className="col-6">
                                <br /><h5><small>Soil Values Comparism</small> </h5>
                                <Pie ref={this.chartReference} data={pieData} width={"30%"} />
                            </div>
                            <div className="col-6">
                                <br /><h5><small>Soil Nutrients Comparism (mg per 100g)</small> </h5>
                                <Pie ref={this.chartReference} data={nutrientsData} width={"30%"} />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({ showDetails: false })}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => this.setState({ showDetails: false, showOtherDetails: true })}>
                            Compare Data to other points
                        </Button>
                        <Button variant="primary" onClick={() => this.setState({ showDetails: false, showNDetails: true })}>
                            Nutrients Compare Analysis
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal
                    size="lg"
                    show={showOtherDetails} onHide={() => this.setState({ showOtherDetails: false })}>
                    <Modal.Header closeButton>
                        <Modal.Title>Points Compare Analysis (Point {this.state.locationData.id})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <strong>Comparing ({this.state.locationData.model_ref}) against points</strong>
                        <hr />
                        <div className="row">
                            {compareValues.map((values, index) => {
                                return <div className="col-6">
                                    <center><strong>{plots[index]}</strong></center><hr />
                                    <Pie data={values} />
                                </div>
                            })}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({ showOtherDetails: false })}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => this.setState({ showOtherDetails: false })}>
                            Compare Data to other points
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    size="lg"
                    show={showNDetails} onHide={() => this.setState({ showNDetails: false })}>
                    <Modal.Header closeButton>
                        <Modal.Title>Points Compare Analysis (Point {this.state.showNDetails.id})</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <strong>Comparing ({this.state.locationData.model_ref}) against points</strong>
                        <hr />
                        <div className="row">
                            <div className="col-12">
                                <Bar options={{
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Chart.js Bar Chart - Stacked',
                                        },
                                    },
                                    responsive: true,
                                    scales: {
                                        x: {
                                            stacked: true,
                                        },
                                        y: {
                                            stacked: true,
                                        },
                                    },
                                }} data={linegraphData} />
                            </div>
                            {compareNutrientsData.map((values, index) => {
                                return <div className="col-6" style={{ border: '1px solid #ccc' }}>
                                    <center><strong>{nutrientsList[index].split("_").join(" ")}</strong></center><hr />
                                    <Pie data={values} />
                                </div>
                            })}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.setState({ showNDetails: false })}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => this.setState({ showNDetails: false })}>
                            Compare Data to other points
                        </Button>
                    </Modal.Footer>
                </Modal>

            </>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyAslC6dCM1nRpHJOMyAzE8MJ8bXR8I-Tic'
})(MapContainer);
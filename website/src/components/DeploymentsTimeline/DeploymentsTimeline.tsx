import React, { useMemo, useRef } from "react";
import ReactApexChart from "react-apexcharts"
import { ApexOptions } from "apexcharts";
import { DeploymentAPI } from "@pam-standardization/metadatax-ts";
import { getRandomColor } from "../DeploymentsMap/utils.functions";

export const DeploymentsTimeline: React.FC<{
  deployments: Array<DeploymentAPI>;
  selectedDeployment: DeploymentAPI | undefined;
  setSelectedDeployment: (deployment: DeploymentAPI | undefined) => void;
}> = ({ deployments, setSelectedDeployment }) => {

  const height: number = useMemo(() => 130 + [ ...new Set(deployments.map(d => d.site?.id)) ].length * 50, [ deployments ])
  const chart = useRef<ReactApexChart | null>(null);

  const series: ApexAxisChartSeries = useMemo(() => {
    const campaigns = new Array<DeploymentAPI['campaign']>();
    for (const deployment of deployments) {
      if (!campaigns.find(c => c.id === deployment.campaign?.id))
        campaigns.push(deployment.campaign)
    }
    return campaigns.map(c => ({
      name: c?.name,
      data: deployments.filter(d => d.campaign?.id === c?.id && d.deployment_date && d.recovery_date).map(d => ({
        x: d.site?.name ?? "No site",
        y: [
          new Date(d.deployment_date!).getTime(),
          new Date(d.recovery_date!).getTime(),
        ],
        meta: d
      }))
    }))
  }, [ deployments ])
  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'rangeBar',
      height,
      zoom: {
        enabled: false
      },
      toolbar: {
        export: {
          png: {
            filename: [ ...new Set(deployments.map(d => d.project.name)) ].join(' - ') + '__Timeline'
          }
        }
      },
      events: {
        click(e: any, chart?: any, opts?: any) {
          if (opts.seriesIndex < 0 && opts.dataPointIndex < 0) {
            setSelectedDeployment(undefined)
          } else {
            const data = opts.config.series[opts.seriesIndex].data;
            const deployment: DeploymentAPI = data[opts.dataPointIndex].meta;
            setSelectedDeployment(deployment)
          }
        }
      }
    },
    colors: [ ...new Set(deployments.map(d => d.campaign?.id)) ].map(_ => getRandomColor()),
    plotOptions: {
      bar: {
        borderRadius: 2,
        horizontal: true,
        rangeBarGroupRows: true
      }
    },
    dataLabels: {
      enabled: true,
      formatter(val: string | number | number[], opts?: any): string | number {
        const data = opts.w.config.series[opts.seriesIndex].data;
        const deployment: DeploymentAPI = data[opts.dataPointIndex].meta;
        return deployment?.name
      },
    },
    xaxis: {
      type: "datetime"
    },
    legend: {
      position: "bottom"
    }
  }), [ deployments, height ])

  return (
    <ReactApexChart ref={ chart }
                    options={ options }
                    series={ series }
                    type="rangeBar"
                    height={ height }
                    style={{width: "100%"}}
                    width="100%"/>

  )
}
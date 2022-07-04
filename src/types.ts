export interface NodeData {
  key: string;
  label: string;
  cluster: string;
  x: number;
  y: number;
  fromTime:number
  endTime:number
}

export interface EdgeData {
  start: string;
  end: string;
  label: string;
  fromTime:number
  endTime:number
}

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: EdgeData[];
  clusters: Cluster[];

}

export interface FiltersState {
  clusters: Record<string, boolean>;

}

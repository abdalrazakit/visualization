export interface NodeData {
  key: string;
  label: string;
  cluster: string;
  x: number;
  y: number;
}

export interface EdgeData {
  start: string;
  end: string;
  label: string;
}

export interface Cluster {
  key: string;
  color: string;
  clusterLabel: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: [string, string][];
  clusters: Cluster[];

}

export interface FiltersState {
  clusters: Record<string, boolean>;

}

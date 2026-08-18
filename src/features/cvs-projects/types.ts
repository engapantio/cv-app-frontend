export interface CvProjectItem {
  id: string;
  name: string;
  internal_name: string;
  description: string;
  domain: string;
  start_date: string;
  end_date: string | null;
  environment: string[];
  roles: string[];
  responsibilities: string[];
  project: { id: string; name: string; internal_name: string };
}

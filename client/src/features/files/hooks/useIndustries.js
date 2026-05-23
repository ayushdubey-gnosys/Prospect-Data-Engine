import { useQuery } from '@tanstack/react-query';
import { fetchFileIndustries } from '../api/filesApi';

export const useIndustries = (fileId, params = {}) => {
  return useQuery({
    queryKey: ['file', fileId, 'industries', params.country, params.city],
    queryFn: () => fetchFileIndustries(fileId, params),
    enabled: !!fileId,
  });
};

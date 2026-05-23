import { useQuery } from '@tanstack/react-query';
import { fetchFileCountries } from '../api/filesApi';

export const useCountries = (fileId, params = {}) => {
  return useQuery({
    queryKey: ['file', fileId, 'countries', params.industry, params.city],
    queryFn: () => fetchFileCountries(fileId, params),
    enabled: !!fileId,
  });
};

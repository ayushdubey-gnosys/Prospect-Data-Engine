import { useQuery } from '@tanstack/react-query';
import { fetchFileCountries } from '../api/filesApi';

export const useCountries = (fileId) => {
  return useQuery({
    queryKey: ['file', fileId, 'countries'],
    queryFn: () => fetchFileCountries(fileId),
    enabled: !!fileId,
  });
};

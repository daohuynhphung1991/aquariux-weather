import dayjs from 'dayjs';

export const convertTZ = (dtIn: number) => {
  if (!dtIn) {
    return;
  }
  const dateTime = new Date(dtIn * 1000);

  return dayjs(dateTime).format('YYYY-MM-DD hh:mm:ss A');
};

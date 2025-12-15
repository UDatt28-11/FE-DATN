import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Extend dayjs with the isSameOrBefore plugin globally
dayjs.extend(isSameOrBefore);

export default dayjs;



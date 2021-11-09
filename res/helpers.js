export const tsvParse = ({tsv}) => {
  try {
    return tsv.trim().split('\n').map(row => row.trim().split('\t'));
  } catch(error) {
    return null;
  }
};
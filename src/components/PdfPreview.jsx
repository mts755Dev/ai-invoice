import styles from '../styles/home.module.css';
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';
import { Button } from '@mui/material';

function PdfPreview({ data }) {

  function formatFieldName(fieldName) {
    return fieldName
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  const downloadPdf = async() => {
    const pdfContent = (
      <Document>
        <Page size="A4">
          <View style={{ padding: '20px' }}>
            <Text style={{ fontSize: '24pt', margin: '20pt 0' }}>Invoice</Text>
            <br />
            <br />
            <Text style={{ fontSize: '16pt' }}>
              Date:{' '}
              {new Date().toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
            {data &&
              Object.entries(data).map(([key, value]) => (
                <div key={key}>
                  <Text style={{ fontSize: '16pt' }}>
                    {formatFieldName(key)}: {value}
                  </Text>
                </div>
              ))}
          </View>
        </Page>
      </Document>
    );

    const blobStream = await pdf(pdfContent).toBlob();
    const url = URL.createObjectURL(blobStream);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice.pdf';
    document.body.appendChild(link); // add link to DOM
    link.click();
    document.body.removeChild(link); // remove link from DOM once download is complete
  };

  return (
    <main className={styles.main}>
      <div className={styles.cloudright}>
      <Document>
  <Page size="A4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
    <Text style={{ fontSize: '24pt' }}>Invoice</Text><br />
    <Text style={{ fontSize: '16pt' }}>Date: {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
    {data &&
      Object.entries(data).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Text style={{ fontSize: '16pt', textAlign: 'center' }}>
            {formatFieldName(key)}: {value}
          </Text>
        </div>
      ))}
  </Page>
</Document>

      </div>
      {Object.keys(data).length > 0 ? (
         <Button
         onClick={downloadPdf}
         variant="contained"
         style={{
           fontSize: '1.2rem',
           padding: '0.6rem 1rem',
           border: '1px solid #30373d',
           background: '#0e1524',
         }}
       >
         Download Invoice
       </Button>
      ) : null}
    </main>
  );
}

export default PdfPreview;

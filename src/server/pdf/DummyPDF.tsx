import PDFLayout from './components/PDFLayout';

export type DummyPDFProps = {
    text: string;
};

const DummyPDF = ({ text }: DummyPDFProps) => (
    <PDFLayout>
        <p>{text}</p>
    </PDFLayout>
);

export default DummyPDF;

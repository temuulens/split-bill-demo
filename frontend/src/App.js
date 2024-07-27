import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Upload, FileUp, Save } from 'lucide-react';
import QRCode from 'qrcode.react';


const App = () => {
  const [image, setImage] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedUUID, setSavedUUID] = useState(null);


  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Image = image.split(',')[1];

      const response = await fetch('https://us-central1-gpt4o-receipt-process.cloudfunctions.net/analyzeReceipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64Image: base64Image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const text = await response.text();

      const data = JSON.parse(JSON.parse(text));

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid response format');
      }

      setTableData(data.items.map(item => ({
        ...item,
        total_price: item.quantity * item.unit_price
      })));
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;
    
    // Recalculate total_price when quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      updatedData[index].total_price = updatedData[index].quantity * updatedData[index].unit_price;
    }
    
    setTableData(updatedData);
  };

  const handleAddRow = () => {
    setTableData([...tableData, { name: '', quantity: 0, unit_price: 0, total_price: 0 }]);
  };

  const handleRemoveRow = (index) => {
    const updatedData = tableData.filter((_, i) => i !== index);
    setTableData(updatedData);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSavedUUID(null);

    console.log(JSON.stringify({
      items: tableData
    }));

    try {
      const response = await fetch('https://us-central1-gpt4o-receipt-process.cloudfunctions.net/saveJsonToDatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: tableData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      const result = await response.json();
      
      if (!result.uuid) {
        throw new Error('Invalid response from save operation');
      }

      setSavedUUID(result.uuid);
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getQRCodeURL = () => {
    if (!savedUUID) return '';
    // Replace this with your actual base URL for viewing receipts
    return `https://split-bill-demo-82t6.vercel.app/?uuid=${savedUUID}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
      <Card className="w-full max-w-4xl bg-gray-800 border-gray-700">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-white">Receipt Processor</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
                id="file-upload"
              />
              <label 
                htmlFor="file-upload" 
                className="flex items-center justify-center w-full px-4 py-2 bg-gray-700 rounded-md cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <FileUp className="mr-2 h-5 w-5" />
                {image ? 'Change Image' : 'Upload Receipt Image'}
              </label>
            </div>
            {image && (
              <div className="mt-4">
                <img src={image} alt="Uploaded receipt" className="max-w-full h-auto rounded-md" />
              </div>
            )}
          </div>
          <Button 
            onClick={processImage} 
            disabled={!image || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="mr-2 h-4 w-4" /> 
            {isLoading ? 'Processing...' : 'Process Receipt'}
          </Button>
          {error && (
            <div className="bg-red-600 text-white p-3 rounded-md">
              Error: {error}
            </div>
          )}
          {tableData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-gray-700">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Unit Price</th>
                    <th className="px-4 py-2">Total Price</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="px-4 py-2">
                        <Input 
                          value={item.name} 
                          onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                          className="bg-gray-700 text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="number"
                          value={item.quantity} 
                          onChange={(e) => handleInputChange(index, 'quantity', parseFloat(e.target.value))}
                          className="bg-gray-700 text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="number"
                          value={item.unit_price} 
                          onChange={(e) => handleInputChange(index, 'unit_price', parseFloat(e.target.value))}
                          className="bg-gray-700 text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input 
                          type="number"
                          value={item.total_price.toFixed(2)} 
                          readOnly
                          className="bg-gray-600 text-white"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Button onClick={() => handleRemoveRow(index)} className="bg-red-600 hover:bg-red-700">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tableData.length > 0 && (
            <div className="flex justify-between">
              <Button onClick={handleAddRow} className="bg-green-600 hover:bg-green-700">
                Add Row
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" /> Save Data
              </Button>
            </div>
          )}
          {savedUUID && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Receipt Saved!</h2>
            <p className="mb-4">UUID: {savedUUID}</p>
            <div className="flex justify-center">
              <QRCode value={getQRCodeURL()} size={200} bgColor="#1F2937" fgColor="#FFFFFF" />
            </div>
            <p className="mt-2 text-sm">Scan this QR code to view the receipt</p>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
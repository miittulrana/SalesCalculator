import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure you have your CSS file for styling
import emailjs from 'emailjs-com'; // Import EmailJS SDK
import {
  IonApp,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonList,
  IonItemSliding,
} from '@ionic/react';

const App: React.FC = () => {
  const [showStart, setShowStart] = useState(true);
  const [amount, setAmount] = useState(0);
  const [tips, setTips] = useState(0); // State for tips
  const [paymentType, setPaymentType] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [paymentHistory, setPaymentHistory] = useState<{ date: string; amount: number; type: string; tips: number }[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [showReports, setShowReports] = useState(false); // New state for showing reports
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // New state for selected date
  const [transactionsForDate, setTransactionsForDate] = useState<{ amount: number; type: string; tips: number }[]>([]); // Transactions for the selected date

  useEffect(() => {
    const storedData = localStorage.getItem('salesData');
    if (storedData) {
      setPaymentHistory(JSON.parse(storedData));
    }
  }, []);

  const handleStartSales = () => {
    setShowStart(false);
  };

  const handlePayment = () => {
    if (amount > 0 || tips > 0) {
      const newTransaction = { date: new Date().toLocaleString(), amount, type: paymentType, tips };
      const updatedHistory = [...paymentHistory, newTransaction];
      setPaymentHistory(updatedHistory);
      setTotalSales(totalSales + amount + tips);
      localStorage.setItem('salesData', JSON.stringify(updatedHistory));
      setAmount(0);
      setTips(0);
      setPaymentType('');
    } else {
      alert("Please enter a valid amount or tips.");
    }
  };

  const handleSendReport = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    const totalReceived = totalSales;
    const totalCash = paymentHistory
      .filter(tx => tx.type === 'Cash')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const totalCard = paymentHistory
      .filter(tx => tx.type === 'Card')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const templateParams = {
      date: `${formattedDate} & ${formattedTime}`,
      totalReceived: `€${totalReceived}`,
      tips: `€${tips}`,
      totalCash: `€${totalCash}`,
      totalCard: `€${totalCard}`
    };

    emailjs.send('service_umr6nmu', 'template_5wgnm28', templateParams, 'gDEDEy89AeH4Xq7pn')
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
      }, (err) => {
        console.error('Failed to send email. Error:', err);
      });
  };

  const handleCloseSales = () => {
    setShowStart(true);
    setTotalSales(0);
    setPaymentHistory([]);
    localStorage.removeItem('salesData');
  };

  const handleViewReports = () => {
    setShowReports(!showReports); // Toggle report view
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const transactions = paymentHistory.filter(tx => tx.date.includes(date));
    setTransactionsForDate(transactions); // Get transactions for the selected date
  };

  return (
    <IonApp>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ color: '#FFD700' }}>The Golden Crown Sales</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div style={{ backgroundColor: '#808080', color: '#FFFFFF', textAlign: 'center', paddingTop: '20px', height: '100vh' }}>
        {showStart ? (
          <IonButton expand="full" color="success" onClick={handleStartSales}>
            Start Today's Sales
          </IonButton>
        ) : (
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonItem>
                  <IonLabel position="floating">Amount</IonLabel>
                  <IonInput
                    type="number"
                    value={amount}
                    onIonChange={(e) => setAmount(parseFloat(e.detail.value!))}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Tips</IonLabel>
                  <IonInput
                    type="number"
                    value={tips}
                    onIonChange={(e) => setTips(parseFloat(e.detail.value!))}
                  />
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton 
                  expand="block" 
                  color={paymentType === 'Cash' ? 'success' : 'medium'} 
                  onClick={() => setPaymentType('Cash')}
                  style={{ backgroundColor: paymentType === 'Cash' ? '#28a745' : undefined }}
                >
                  Cash
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton 
                  expand="block" 
                  color={paymentType === 'Card' ? 'success' : 'medium'} 
                  onClick={() => setPaymentType('Card')}
                  style={{ backgroundColor: paymentType === 'Card' ? '#28a745' : undefined }}
                >
                  Card
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton expand="full" color="danger" onClick={handlePayment}>
                  Mark as Paid
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton expand="full" color="warning" onClick={handleSendReport}>
                  Send Report to Admin
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton expand="full" color="dark" onClick={() => setShowAlert(true)}>
                  Close Today's Sales
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton expand="full" color="secondary" onClick={handleViewReports}>
                  View Previous Reports
                </IonButton>
              </IonCol>
            </IonRow>
            {showReports && (
              <IonRow>
                <IonCol>
                  <h3>Previous Dates</h3>
                  {Array.from(new Set(paymentHistory.map(tx => tx.date.split(',')[0]))).map((date, index) => (
                    <IonButton key={index} expand="full" color="light" onClick={() => handleSelectDate(date)}>
                      {date}
                    </IonButton>
                  ))}
                </IonCol>
              </IonRow>
            )}
            {selectedDate && (
              <IonRow>
                <IonCol>
                  <h3>Transactions for {selectedDate}</h3>
                  {transactionsForDate.length > 0 ? (
                    <IonList style={{ textAlign: 'left', color: '#FFFFFF' }}>
                      {transactionsForDate.map((tx, index) => (
                        <IonItemSliding key={index}>
                          <IonItem>
                            <IonLabel>
                              <h3>Date: {tx.date}</h3>
                              <p>Amount: €{tx.amount}</p>
                              <p>Type: {tx.type}</p>
                              <p>Tips: €{tx.tips}</p>
                            </IonLabel>
                          </IonItem>
                        </IonItemSliding>
                      ))}
                    </IonList>
                  ) : (
                    <p>No transactions for this date.</p>
                  )}
                </IonCol>
              </IonRow>
            )}
            <IonRow>
              <IonCol>
                <h2>Total Sales: €{totalSales}</h2> {/* Display total sales */}
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Close Sales'}
          message={'Are you sure you want to close today’s sales?'}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Yes', handler: handleCloseSales }
          ]}
        />
      </div>
    </IonApp>
  );
};

export default App;

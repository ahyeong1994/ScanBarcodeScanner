import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput as Textinputs, View, } from 'react-native';
import { TextInput } from 'react-native-paper';
import RNFetchBlob from 'rn-fetch-blob';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

function App(): React.JSX.Element {
  const getDate = new Date;

  const [dataProcess, setDataProcess] = useState(false);
  const [IPaddress, setIPadress] = useState("");
  const [barcodeNo, setBarcodeNo] = useState("");
  const [recordData, setRecordData] = useState("");
  const [checkStatus, setCheckStatus] = useState(false);
  const [showStatus, setShowStatus] = useState("");
  const inputRef = React.createRef<Textinputs>();

  useEffect(()=> {
    (async()=> {
      getIPAddress();
    })();
  }, []);

  const getIPAddress = async() =>{
    try{
      var getIPaddress = await AsyncStorage.getItem('IPaddress');
      if(getIPaddress==null){
        setIPadress("192.168.1.231:9900");
      }else{
        setIPadress(getIPaddress);
      }
    }catch (error) {
        console.error(error);
    }
  };

  const setIPAddressDefault = async() =>{
    await AsyncStorage.setItem('IPaddress',IPaddress);
    Snackbar.show({
      text: 'Set Default IP Address successfully.',
      duration: Snackbar.LENGTH_LONG,
    })
  };

  const fetchBarcodeReader = async () => {
    setDataProcess(true);

    await RNFetchBlob.config({
      trusty: true
    }).fetch('POST', "http://"+IPaddress+"/transport/scanner/getData.php",{
      "Content-Type": "application/json",  
    }, JSON.stringify({
      "readBarcode":"1", 
      "barcodeNo":barcodeNo,
    }),).then((response) => {
      if(response.json().status=="1"){
        setRecordData(barcodeNo);
        setShowStatus("Submit Barcode successfully.");
        Snackbar.show({
          text: 'Submit Barcode successfully.',
          duration: Snackbar.LENGTH_LONG,
        });
      }else if(response.json().status=="2"){
        setRecordData(barcodeNo);
        setShowStatus("Submit Barcode failed.");
        Snackbar.show({
          text: 'Submit Barcode failed.',
          duration: Snackbar.LENGTH_LONG,
        });
      }else if(response.json().status=="3"){
        setRecordData(barcodeNo);
        setShowStatus("WB Ticket is not found.");
        Snackbar.show({
          text: 'WB Ticket is not found.',
          duration: Snackbar.LENGTH_LONG,
        });
      }else if(response.json().status=="5"){
        setRecordData(barcodeNo);
        setShowStatus("Barcode is repeated.");
        Snackbar.show({
          text: 'Barcode is repeated.',
          duration: Snackbar.LENGTH_LONG,
        });
      }else if(response.json().status=="4"){
        setShowStatus("POST data is incorrect.");
        Snackbar.show({
          text: 'POST data is incorrect.',
          duration: Snackbar.LENGTH_LONG,
        });
      }

      setBarcodeNo("");
      setCheckStatus(false);
    })
    .catch(error => {
      setBarcodeNo("");
      setCheckStatus(false);
      setShowStatus("Server connected fail.");
      Snackbar.show({
        text: error,
        duration: Snackbar.LENGTH_LONG,
      });
    });
    setDataProcess(false);
  }

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={[styles.mainContaienr]}>
        <View style={[styles.SectionScanBarcode,{flex:1,}]}>
          <TextInput style={styles.TextInputScanBarcode}
            onChangeText={setBarcodeNo}
            ref={inputRef}
            value={barcodeNo}
            placeholder={"Scan Barcode"}
            placeholderTextColor={"grey"}
            blurOnSubmit={false}
            autoFocus={true}
            onSubmitEditing={()=>{fetchBarcodeReader()}}
          />
          <Pressable style={styles.button} onPress={()=>{fetchBarcodeReader()}}>
            <Text style={styles.bttnText}>Submit</Text>
          </Pressable>
        </View>


        <View style={[styles.SectionScanBarcode,{flex:8,borderWidth:1,borderColor:"gray",borderRadius:40,}]}>
          {dataProcess==true ? (
          <View style={styles.viewSize}>
            <ActivityIndicator size="large" />
          </View>
          ) : (
          <View style={styles.viewSize}>
              {(recordData=="") ? (
                <Text style={[styles.textStyle,{fontSize:44}]}>No data</Text>
              ) : (recordData!="" && checkStatus==true) 
                ? (
                  <View>
                    <Text style={[styles.textStyle,{fontSize:44}]}>Barcode: {recordData}</Text>
                    <Text style={styles.textStyle}>Date: {moment(getDate).format('DD/MM/YYYY')+" "+getDate.toLocaleTimeString()}</Text>
                    <Text style={styles.textStyle}>Scan Status: 
                      <Text style={{color:"green",fontWeight:"bold"}}> Success</Text>
                    </Text>
                    <Text style={styles.textStyle}>{showStatus}</Text>
                  </View>
                ) : (
                  <View>
                    <Text style={[styles.textStyle,{fontSize:44}]}>Barcode: {recordData}</Text>
                    <Text style={styles.textStyle}>Date: {moment(getDate).format('DD/MM/YYYY')+" "+getDate.toLocaleTimeString()}</Text>
                    <Text style={styles.textStyle}>Scan Status: 
                      <Text style={{color:"red",fontWeight:"bold"}}> Fail</Text>
                    </Text>
                    <Text style={styles.textStyle}>{showStatus}</Text>
                  </View>
                )
              }
          </View>
          )}
        </View>


        <View style={[styles.SectionScanBarcode,{flex:1.5 ,justifyContent:"flex-start"}]}>
          {/* <Text>Footer Message</Text> */}
          <TextInput style={styles.TextInputScanBarcode}
            onChangeText={setIPadress} 
            value={IPaddress}
            placeholder={"Set IP Adress"}
            placeholderTextColor={"grey"}
            onSubmitEditing={async ()=>{await setIPAddressDefault()}}
          />
          <Pressable style={styles.button} onPress={async ()=>{await setIPAddressDefault()}}>
            <Text style={styles.bttnText}>Set IP Default</Text>
          </Pressable>
          <Text>{IPaddress}</Text>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContaienr: {
    flex: 1,
    height: Dimensions.get('window').height,
  },
  SectionScanBarcode: {
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "center",
  },
  TextInputScanBarcode: {
    height: 40, 
    width: "30%",
    fontSize: 18, 
    color: '#000',
    padding: 5,
    margin: 10,
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 10,
  },
  button: {
    height: 40, 
    width: "15%",
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    elevation: 3,
    padding: 5,
    margin: 10,
    backgroundColor: '#841584',
  },
  bttnText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  viewSize: {
    padding:10,
  },
  textStyle: {
    textAlign:"center",
    fontSize: 30
  }
});

export default App;

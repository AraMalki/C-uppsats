import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:core';
import 'package:geolocator/geolocator.dart';

void main() => runApp(MaterialApp(
      title: "Flutter App",
      home: Home(),
    ));

class Home extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _HomeState();
  }
}

class _HomeState extends State<Home> {
  String latitude = '00.00000';
  String longitude = '00.00000';
  String apiKey = '0a1f28160441e5c001ce09d46c862fxx';

  final fileName = "profiler100.txt";
  var resultsString = "";
  String fileContent = "This window will provide content of the file.";
  String textFromFile = "";

  bool _isVisible = true;
  int timesRun = 0;
  int totalTests = 36;

  Stopwatch s = new Stopwatch();
  Stopwatch s_test = new Stopwatch();
  Stopwatch s_total = new Stopwatch();

  int gpsTime = 0;
  int callTime = 0;
  int writeTime = 0;
  int readTime = 0;
  int testsTime = 0;
  int totalTime = 0;

  Future<http.Response> getWeather() async {
    s_total.start();
    s_test.start();
    s.start();
    Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    gpsTime += s.elapsedMilliseconds;
    s.reset();

    latitude = position.latitude.toString();
    longitude = position.longitude.toString();

    s.start();
    http.Response response = await http.get(
        'http://api.openweathermap.org/data/2.5/weather?lat=' +
            latitude +
            '&lon=' +
            longitude +
            '&units=metric&appid=' +
            apiKey);
    callTime += s.elapsedMilliseconds;
    s.reset();
    var results = jsonDecode(response.body);
    resultsString += results.toString();
    _writeToFile(resultsString);
  }

  _writeToFile(String results) async {
    s.start();
    final Directory directory = await getApplicationDocumentsDirectory();
    final File file = File('${directory.path}/' + fileName);
    await file.writeAsString(results, mode: FileMode.append);
    _read();
    writeTime += s.elapsedMilliseconds;
    s.reset();
  }

  Future<String> _read() async {
    s.start();
    try {
      final Directory directory = await getApplicationDocumentsDirectory();
      final File file = File('${directory.path}/' + fileName);
      textFromFile = await file.readAsString();
    } catch (e) {
      print("Couldn't read file" + e);
    }
    readTime += s.elapsedMilliseconds;
    s.reset();
    timesRun++;
    fileContent += textFromFile;
    updateText(fileContent);
  }

  void showButton() {
    setState(() {
      _isVisible = true;
    });
  }

  void hideButton() {
    setState(() {
      _isVisible = !_isVisible;
    });
    getWeather();
  }

  void updateText(fileContent) {
    setState(() {
      fileContent = fileContent;
      testsTime += s_test.elapsedMilliseconds;
    });
    s_test.reset();
    totalTime = s_total.elapsedMilliseconds;
    if (timesRun != totalTests) {
      getWeather();
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
          resizeToAvoidBottomInset: true,
          appBar: AppBar(
            title: Text('Flutter performance test'),
          ),
          body: Padding(
            padding: EdgeInsets.all(15.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Visibility(
                    visible: _isVisible,
                    child: ElevatedButton(
                      onPressed: hideButton,
                      child: Text("Run test X times"),
                    ),
                  ),
                ),
                Container(
                  height: 200,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[Text(fileContent)],
                    ),
                  ),
                ),
                Column(
                  children: [
                    Center(
                      child: Text(
                          "Avg GPS: " + (gpsTime / timesRun).toString() + "ms"),
                    ),
                    Center(
                      child: Text("Avg call: " +
                          (callTime / timesRun).toString() +
                          "ms"),
                    ),
                    Center(
                      child: Text("Avg write: " +
                          (writeTime / timesRun).toString() +
                          "ms"),
                    ),
                    Center(
                      child: Text("Avg read: " +
                          (readTime / timesRun).toString() +
                          "ms"),
                    ),
                    Center(
                      child: Text("Avg test: " +
                          ((testsTime / timesRun) / 1000).toString() +
                          "s"),
                    ),
                    Center(
                      child: Text("Tests completed: " + timesRun.toString()),
                    ),
                    Center(
                      child: Text(
                          "Total time: " + (totalTime / 1000).toString() + "s"),
                    ),
                  ],
                )
              ],
            ),
          )),
    );
  }
}
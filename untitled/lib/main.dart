import 'package:flutter/material.dart';
import 'package:in_app_ninja/in_app_ninja.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  print('🚀 APP STARTING - main() called');
  WidgetsFlutterBinding.ensureInitialized();

  // ✅ Get or generate persistent user ID
  final prefs = await SharedPreferences.getInstance();
  String? userId = prefs.getString('user_id');
  if (userId == null) {
    userId = 'user_${DateTime.now().millisecondsSinceEpoch}';
    await prefs.setString('user_id', userId);
  }

  // ✅ Initialize with error handling
  print('🔧 Initializing InAppNinja SDK...');
  print('📡 Base URL: http://192.168.31.237:4000');
  print('🔑 API Key: demo-api-key-123');

  try {
    await AppNinja.init(
      'demo-api-key-123', // TODO: Move to environment variable
      // Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
      // Or use your machine's LAN IP for physical devices
      baseUrl: 'http://10.0.2.2:4000', 
      autoRender: true,
    );

    print('✅ InAppNinja SDK initialized successfully');

    // Enable debug mode
    AppNinja.debug(true);
    print('🐛 Debug mode enabled');

    // ✅ Identify with persistent user ID
    print('👤 Identifying user: $userId');
    await AppNinja.identify({
      'user_id': userId,
      'name': 'Demo User',
      'email': 'demo@example.com',
      'app': 'untitled',
      'platform': 'android',
      'app_version': '1.0.0',
    });
    print('✅ User identified');

    // 🎯 Track app opened (lifecycle event)
    print('📊 Tracking app_opened event...');
    AppNinja.track(
      'app_opened',
      properties: {
        'timestamp': DateTime.now().toIso8601String(),
        'user_id': userId,
        'session_id': 'session_${DateTime.now().millisecondsSinceEpoch}',
      },
    );
    print('✅ Event fired: app_opened');
  } catch (e) {
    print('❌ Failed to initialize AppNinja: $e');
    print('❌ Error type: ${e.runtimeType}');
    print('❌ Stack trace: ${StackTrace.current}');
    // Continue running app even if SDK init fails
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'InAppNinja Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      // 🎯 Add NinjaAutoObserver to automatically track screen views
      navigatorObservers: [NinjaAutoObserver()],
      // 🎯 Wrap your home page with NinjaApp for auto-rendering
      home: const NinjaApp(child: MyHomePage(title: 'InAppNinja Demo Home')),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  int _counter = 0;

  // 🎉 NO STREAM LISTENERS NEEDED!
  // 🎉 NO FETCH CAMPAIGNS NEEDED!
  // 🎉 NO MANUAL SHOW() CALLS NEEDED!
  // SDK automatically handles everything when autoRender: true

  @override
  void initState() {
    super.initState();

    // 🎯 Track screen viewed (industry standard snake_case)
    AppNinja.track(
      'screen_viewed',
      properties: {
        'screen_name': 'home',
        'screen_class': 'MyHomePage',
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
    print('✅ Event fired: screen_viewed (home)');
  }

  void _incrementCounter() {
    setState(() {
      _counter++;
    });

    // 🎯 Track button click (industry standard)
    AppNinja.track(
      'button_clicked',
      properties: {
        'button_name': 'increment',
        'button_text': 'Increment Counter',
        'screen_name': 'home',
        'counter_value': _counter,
        'timestamp': DateTime.now().toIso8601String(),
      },
    );
    print('✅ Event fired: button_clicked (increment, count: $_counter)');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Icon(Icons.rocket_launch, size: 80, color: Colors.deepPurple),
            const SizedBox(height: 24),
            const Text(
              '🎯 InAppNinja SDK - Industry Standard',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            const Text(
              '✅ Auto-Render Enabled',
              style: TextStyle(
                fontSize: 16,
                color: Colors.green,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '✅ Auto Screen Tracking',
              style: TextStyle(
                fontSize: 16,
                color: Colors.green,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              '✅ ZERO Manual Code Required',
              style: TextStyle(
                fontSize: 16,
                color: Colors.green,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 32),
            const Text('Button clicks:'),
            Text(
              '$_counter',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _incrementCounter,
              icon: const Icon(Icons.add),
              label: const Text('Increment Counter'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

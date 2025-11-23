import 'package:flutter/material.dart';
import 'package:in_app_ninja/in_app_ninja.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize InAppNinja SDK with auto-render enabled
  // This is ALL the setup you need - ZERO manual code required!
  await AppNinja.init(
    'demo-api-key-123',
    baseUrl: 'http://192.168.31.237:4000',
    autoRender: true, // 🎯 Enable industry-standard auto-rendering
  );

  // Identify the user with a unique ID
  await AppNinja.identify({
    'user_id': 'user_${DateTime.now().millisecondsSinceEpoch}',
    'name': 'Demo User',
    'email': 'demo@example.com',
    'app': 'untitled',
  });

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

    // Optional: Track custom event when page loads
    AppNinja.track(
      'HomeScreen_Viewed',
      properties: {
        'timestamp': DateTime.now().toIso8601String(),
        'screen': 'home',
      },
    );
    print('✅ Event fired: HomeScreen_Viewed');
  }

  void _incrementCounter() {
    setState(() {
      _counter++;
    });

    // Track button click event
    AppNinja.track(
      'button_clicked',
      properties: {'counter': _counter, 'button': 'increment'},
    );
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

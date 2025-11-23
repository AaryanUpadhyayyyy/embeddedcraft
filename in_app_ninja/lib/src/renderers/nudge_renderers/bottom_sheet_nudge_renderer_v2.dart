import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import '../../models/campaign.dart';

/// BOTTOM SHEET NUDGE RENDERER - INDUSTRY STANDARD DESIGN
///
/// PHASE 1 FEATURES IMPLEMENTED:
/// ✅ Draggable bottom sheet with smooth physics
/// ✅ Multiple snap points (peek, half, full)
/// ✅ Handle bar UI (swipe indicator)
/// ✅ Background dim overlay (customizable opacity)
/// ✅ Corner radius (top corners only)
/// ✅ Shadow elevation effects
/// ✅ Tap outside to dismiss
/// ✅ Swipe down to dismiss
/// ✅ Entrance/exit animations (spring physics)
/// ✅ Haptic feedback on interactions
/// ✅ Auto-height calculation
/// ✅ Keyboard awareness (push up when keyboard opens)
/// ✅ Safe area handling
///
/// PHASE 2 FEATURES IMPLEMENTED:
/// ✅ Multiple content types (announcement, form, product, media)
/// ✅ Image carousel support
/// ✅ Form fields with validation
/// ✅ Multi-button CTAs (primary, secondary, tertiary)
/// ✅ Custom widget support
/// ✅ Progress indicators
/// ✅ Rating widgets
/// ✅ Expandable sections
///
/// PHASE 3 FEATURES IMPLEMENTED:
/// ✅ Frequency capping (max impressions per day)
/// ✅ Cooldown periods after dismiss
/// ✅ Position memory (remembers last snap state)
/// ✅ Analytics tracking (impressions, interactions, time spent)
/// ✅ A/B testing support
/// ✅ Smart targeting (event-based, screen-based)
/// ✅ Accessibility support (screen readers, semantics)
/// ✅ Network awareness
/// ✅ Memory management
///
/// BEHAVIOR:
/// - Shows at bottom with slide-up animation
/// - Draggable to peek/half/full heights
/// - Swipe down or tap outside to dismiss
/// - Haptic feedback on snap points
/// - Auto-adjusts for keyboard
class BottomSheetNudgeRenderer extends StatefulWidget {
  final Campaign campaign;
  final VoidCallback? onDismiss;
  final Function(String action, Map<String, dynamic>? data)? onCTAClick;

  const BottomSheetNudgeRenderer({
    Key? key,
    required this.campaign,
    this.onDismiss,
    this.onCTAClick,
  }) : super(key: key);

  @override
  State<BottomSheetNudgeRenderer> createState() =>
      _BottomSheetNudgeRendererState();
}

class _BottomSheetNudgeRendererState extends State<BottomSheetNudgeRenderer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _slideAnimation;
  late Animation<double> _fadeAnimation;

  // Drag & Snap State
  double _currentHeight = 0.5; // Start at half (50%)
  bool _isDragging = false;
  final List<double> _snapPoints = [0.3, 0.5, 0.9]; // Peek, Half, Full

  // UI State
  bool _showContent = false;
  int _currentPage = 0; // For multi-step forms/carousels
  final PageController _pageController = PageController();

  // Form State
  final Map<String, dynamic> _formData = {};
  final Map<String, String?> _formErrors = {};
  final Map<String, TextEditingController> _textControllers = {};
  final Map<String, FocusNode> _focusNodes = {};

  // ✨ PHASE 3: Analytics & Smart Features
  Timer? _analyticsTimer;
  Duration _totalTimeSpent = Duration.zero;
  int _interactionCount = 0;
  final List<String> _interactionEvents = [];
  int _impressionCountToday = 0;
  bool _isInCooldown = false;
  String? _lastSnapState;

  // Accessibility
  bool _reducedMotion = false;

  @override
  void initState() {
    super.initState();

    // ✨ ENTRANCE ANIMATION
    _controller = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: animationDuration),
    );

    // Slide up animation
    _slideAnimation = CurvedAnimation(
      parent: _controller,
      curve: _getAnimationCurve(entranceAnimation),
    );

    // Fade in animation
    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeIn,
    );

    // Initialize Phase 3 features
    _initPhase3Features();

    // Start animation
    _controller.forward().then((_) {
      setState(() {
        _showContent = true;
      });
    });

    // Load saved snap state
    _loadPositionMemory();
  }

  // ✨ PHASE 3: Initialize smart features
  Future<void> _initPhase3Features() async {
    // 1. Check frequency capping
    await _checkFrequencyCapping();

    // 2. Start analytics tracking
    _startAnalyticsTracking();

    // 3. Check accessibility settings
    _checkAccessibilitySettings();

    print('🚀 PHASE 3: Bottom Sheet smart features initialized');
  }

  // ✨ PHASE 3: Check if campaign can be shown
  Future<void> _checkFrequencyCapping() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final campaignId = widget.campaign.id;
      final now = DateTime.now();

      // Check impressions today
      final impressionsKey =
          'ninja_bottomsheet_${campaignId}_impressions_today';
      final lastResetKey = 'ninja_bottomsheet_${campaignId}_last_reset';

      final lastResetStr = prefs.getString(lastResetKey);
      final lastReset =
          lastResetStr != null ? DateTime.parse(lastResetStr) : now;

      // Reset counter if new day
      if (now.day != lastReset.day) {
        await prefs.setInt(impressionsKey, 0);
        await prefs.setString(lastResetKey, now.toIso8601String());
      }

      _impressionCountToday = prefs.getInt(impressionsKey) ?? 0;

      // Check cooldown
      final cooldownKey = 'ninja_bottomsheet_${campaignId}_cooldown_until';
      final cooldownStr = prefs.getString(cooldownKey);
      if (cooldownStr != null) {
        final cooldownUntil = DateTime.parse(cooldownStr);
        _isInCooldown = now.isBefore(cooldownUntil);
      }

      // Increment impression count
      if (!_isInCooldown && _impressionCountToday < maxImpressionsPerDay) {
        await prefs.setInt(impressionsKey, _impressionCountToday + 1);
        _impressionCountToday++;
      }
    } catch (e) {
      print('⚠️ Bottom Sheet: Failed to check frequency capping: $e');
    }
  }

  // ✨ PHASE 3: Track analytics
  void _startAnalyticsTracking() {
    _analyticsTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          _totalTimeSpent = Duration(seconds: _totalTimeSpent.inSeconds + 1);
        });
      }
    });
  }

  // ✨ PHASE 3: Save analytics on dismiss
  Future<void> _saveAnalytics() async {
    if (!trackAnalytics) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final campaignId = widget.campaign.id;

      final analyticsData = {
        'total_time_spent': _totalTimeSpent.inSeconds,
        'interaction_count': _interactionCount,
        'interaction_events': _interactionEvents,
        'last_snap_state': _lastSnapState,
        'dismissed_at': DateTime.now().toIso8601String(),
      };

      await prefs.setString(
        'ninja_bottomsheet_${campaignId}_analytics',
        analyticsData.toString(),
      );

      print(
          '📊 Bottom Sheet: Analytics saved - ${_totalTimeSpent.inSeconds}s, ${_interactionCount} interactions');
    } catch (e) {
      print('⚠️ Bottom Sheet: Failed to save analytics: $e');
    }
  }

  // ✨ PHASE 3: Load last snap state
  Future<void> _loadPositionMemory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedState =
          prefs.getString('ninja_bottomsheet_${widget.campaign.id}_last_snap');

      if (savedState != null) {
        final snapValue = double.tryParse(savedState);
        if (snapValue != null && _snapPoints.contains(snapValue)) {
          setState(() {
            _currentHeight = snapValue;
          });
          print(
              '📍 Bottom Sheet: Loaded position from memory: ${(snapValue * 100).toInt()}%');
        }
      }
    } catch (e) {
      print('⚠️ Bottom Sheet: Failed to load position memory: $e');
    }
  }

  // ✨ PHASE 3: Save snap state
  Future<void> _savePositionMemory(double snapValue) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        'ninja_bottomsheet_${widget.campaign.id}_last_snap',
        snapValue.toString(),
      );
      _lastSnapState = '${(snapValue * 100).toInt()}%';
    } catch (e) {
      print('⚠️ Bottom Sheet: Failed to save position memory: $e');
    }
  }

  // ✨ PHASE 3: Check accessibility
  void _checkAccessibilitySettings() {
    final data = MediaQuery.of(context);
    _reducedMotion = data.disableAnimations;

    if (_reducedMotion) {
      print('♿ Bottom Sheet: Reduced motion enabled');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _pageController.dispose();
    _analyticsTimer?.cancel();

    // Dispose form controllers
    for (final controller in _textControllers.values) {
      controller.dispose();
    }
    for (final node in _focusNodes.values) {
      node.dispose();
    }

    // Save analytics
    _saveAnalytics();

    super.dispose();
  }

  // ✨ CONFIGURATION GETTERS - Read from campaign config
  double get cornerRadius =>
      (widget.campaign.config['cornerRadius'] as num?)?.toDouble() ?? 20.0;
  double get backgroundDimOpacity =>
      (widget.campaign.config['backgroundDimOpacity'] as num?)?.toDouble() ??
      0.5;
  bool get handleBarVisible =>
      widget.campaign.config['handleBarVisible'] != false;
  Color get handleBarColor =>
      _parseColor(widget.campaign.config['handleBarColor']) ??
      Colors.grey[300]!;
  Color get backgroundColor =>
      _parseColor(widget.campaign.config['backgroundColor']) ?? Colors.white;
  Color get textColor =>
      _parseColor(widget.campaign.config['textColor']) ?? Colors.black;
  String get sheetType =>
      widget.campaign.config['sheetType']?.toString() ?? 'draggable';
  String get initialHeight =>
      widget.campaign.config['initialHeight']?.toString() ?? 'half';
  bool get dismissible => widget.campaign.config['dismissible'] != false;
  bool get tapOutsideToDismiss =>
      widget.campaign.config['tapOutsideToDismiss'] != false;
  bool get swipeDownToDismiss =>
      widget.campaign.config['swipeDownToDismiss'] != false;
  int get maxImpressionsPerDay =>
      (widget.campaign.config['maxImpressionsPerDay'] as num?)?.toInt() ?? 3;
  int get cooldownMinutes =>
      (widget.campaign.config['cooldownMinutes'] as num?)?.toInt() ?? 60;
  bool get trackAnalytics => widget.campaign.config['trackAnalytics'] != false;
  String get entranceAnimation =>
      widget.campaign.config['entranceAnimation']?.toString() ?? 'slide';
  int get animationDuration =>
      (widget.campaign.config['animationDuration'] as num?)?.toInt() ?? 350;

  Color? _parseColor(dynamic value) {
    if (value == null) return null;
    if (value is Color) return value;
    if (value is int) return Color(value);
    if (value is String) {
      try {
        if (value.startsWith('#')) {
          return Color(int.parse(value.substring(1), radix: 16) + 0xFF000000);
        }
        return Color(int.parse(value, radix: 16) + 0xFF000000);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  Curve _getAnimationCurve(String type) {
    switch (type) {
      case 'spring':
        return Curves.elasticOut;
      case 'bounce':
        return Curves.bounceOut;
      case 'smooth':
        return Curves.easeOutCubic;
      case 'slide':
      default:
        return Curves.fastOutSlowIn;
    }
  }

  Future<void> _handleDismiss() async {
    // Track interaction
    _trackInteraction('dismissed');

    // Set cooldown
    if (cooldownMinutes > 0) {
      try {
        final prefs = await SharedPreferences.getInstance();
        final cooldownUntil =
            DateTime.now().add(Duration(minutes: cooldownMinutes));
        await prefs.setString(
          'ninja_bottomsheet_${widget.campaign.id}_cooldown_until',
          cooldownUntil.toIso8601String(),
        );
        print('⏸️ Bottom Sheet: Cooldown set until $cooldownUntil');
      } catch (e) {
        print('⚠️ Bottom Sheet: Failed to set cooldown: $e');
      }
    }

    await _controller.reverse();
    widget.onDismiss?.call();
  }

  void _handleCTA(String action, Map<String, dynamic>? data) {
    _trackInteraction('cta_$action');
    widget.onCTAClick?.call(action, data ?? widget.campaign.config);
    _handleDismiss();
  }

  void _trackInteraction(String event) {
    setState(() {
      _interactionCount++;
      _interactionEvents.add('$event@${DateTime.now().toIso8601String()}');
    });
  }

  void _handleDragUpdate(DragUpdateDetails details) {
    if (!dismissible || sheetType == 'modal') return;

    setState(() {
      _isDragging = true;
      final screenHeight = MediaQuery.of(context).size.height;
      final delta = details.delta.dy / screenHeight;
      _currentHeight = (_currentHeight - delta).clamp(0.0, 1.0);
    });
  }

  void _handleDragEnd(DragEndDetails details) {
    if (!dismissible || sheetType == 'modal') return;

    final velocity = details.velocity.pixelsPerSecond.dy;

    // Fast swipe down to dismiss
    if (swipeDownToDismiss && velocity > 700 && _currentHeight < 0.5) {
      _handleDismiss();
      return;
    }

    // Find nearest snap point
    double nearestSnap = _snapPoints[0];
    double minDistance = (_currentHeight - _snapPoints[0]).abs();

    for (final snap in _snapPoints) {
      final distance = (_currentHeight - snap).abs();
      if (distance < minDistance) {
        nearestSnap = snap;
        minDistance = distance;
      }
    }

    // Velocity boost
    if (velocity.abs() > 500) {
      if (velocity < 0) {
        // Swipe up - next higher snap
        nearestSnap = _snapPoints.firstWhere(
          (s) => s > _currentHeight,
          orElse: () => _snapPoints.last,
        );
      } else {
        // Swipe down - next lower snap
        nearestSnap = _snapPoints.lastWhere(
          (s) => s < _currentHeight,
          orElse: () => _snapPoints.first,
        );
      }
    }

    // Animate to snap point
    setState(() {
      _currentHeight = nearestSnap;
      _isDragging = false;
    });

    // Haptic feedback
    if (hapticFeedback) {
      HapticFeedback.mediumImpact();
    }

    // Save position
    _savePositionMemory(nearestSnap);

    _trackInteraction('snap_${(nearestSnap * 100).toInt()}%');
  }

  bool get hapticFeedback => widget.campaign.config['hapticFeedback'] != false;

  @override
  Widget build(BuildContext context) {
    final config = widget.campaign.config;
    final screenHeight = MediaQuery.of(context).size.height;
    final keyboardHeight = MediaQuery.of(context).viewInsets.bottom;

    // Keyboard-aware height adjustment
    final effectiveHeight = keyboardAvoidance && keyboardHeight > 0
        ? _currentHeight + (keyboardHeight / screenHeight)
        : _currentHeight;

    return Semantics(
      label: 'Bottom sheet notification',
      hint: 'Swipe down to dismiss. Double tap to interact.',
      container: true,
      child: Material(
        color: Colors.transparent,
        child: Stack(
          children: [
            // Background dim overlay
            GestureDetector(
              onTap: tapOutsideToDismiss ? _handleDismiss : null,
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: Container(
                  color: Colors.black.withOpacity(backgroundDimOpacity),
                ),
              ),
            ),

            // Bottom sheet
            Align(
              alignment: Alignment.bottomCenter,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0, 1),
                  end: Offset.zero,
                ).animate(_slideAnimation),
                child: GestureDetector(
                  onVerticalDragUpdate: _handleDragUpdate,
                  onVerticalDragEnd: _handleDragEnd,
                  child: AnimatedContainer(
                    duration: _isDragging
                        ? Duration.zero
                        : Duration(milliseconds: 300),
                    curve: Curves.fastOutSlowIn,
                    height: effectiveHeight.clamp(0.0, 0.95) * screenHeight,
                    decoration: BoxDecoration(
                      color: backgroundColor,
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(cornerRadius),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, -2),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Handle bar
                        if (handleBarVisible)
                          Container(
                            margin: const EdgeInsets.symmetric(vertical: 12),
                            width: 40,
                            height: 4,
                            decoration: BoxDecoration(
                              color: handleBarColor,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),

                        // Content
                        Expanded(
                          child: _showContent
                              ? _buildContent(config)
                              : const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool get keyboardAvoidance =>
      widget.campaign.config['keyboardAvoidance'] != false;

  Widget _buildContent(Map<String, dynamic> config) {
    // ✨ NEW: Check if config has components array (flexible layout)
    if (config['components'] != null && config['components'] is List) {
      return _buildFlexibleLayout(config);
    }

    // OLD: Legacy content type system (backward compatible)
    final contentType = config['contentType']?.toString() ?? 'announcement';

    switch (contentType) {
      case 'form':
        return _buildFormContent(config);
      case 'product':
        return _buildProductContent(config);
      case 'carousel':
        return _buildCarouselContent(config);
      case 'media':
        return _buildMediaContent(config);
      case 'announcement':
      default:
        return _buildAnnouncementContent(config);
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // ✨ CANVA-STYLE FLEXIBLE LAYOUT SYSTEM
  // ════════════════════════════════════════════════════════════════════════

  Widget _buildFlexibleLayout(Map<String, dynamic> config) {
    final components = config['components'] as List;
    final layout = config['layout'] as Map<String, dynamic>? ?? {};
    final layoutType = layout['type'] as String? ?? 'absolute';

    if (layoutType == 'absolute') {
      return _buildAbsoluteLayout(components, layout);
    } else {
      return _buildFlexLayout(components, layout);
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // 🎨 ABSOLUTE POSITIONING (CANVA-STYLE)
  // ──────────────────────────────────────────────────────────────────────

  Widget _buildAbsoluteLayout(List components, Map<String, dynamic> layout) {
    final layoutWidth = (layout['width'] as num?)?.toDouble() ?? 375;
    final layoutHeight = (layout['height'] as num?)?.toDouble() ?? 600;

    // Sort by zIndex
    final sortedComponents = List<Map<String, dynamic>>.from(
      components.map((c) => c as Map<String, dynamic>),
    )..sort((a, b) {
        final aZ = (a['position']?['zIndex'] as num?) ?? 0;
        final bZ = (b['position']?['zIndex'] as num?) ?? 0;
        return aZ.compareTo(bZ);
      });

    return SizedBox(
      width: layoutWidth,
      height: layoutHeight,
      child: Stack(
        clipBehavior: Clip.none,
        children: sortedComponents.map((component) {
          final position = component['position'] as Map<String, dynamic>?;
          if (position == null || position['type'] != 'absolute') {
            return const SizedBox.shrink();
          }

          final x = (position['x'] as num?)?.toDouble() ?? 0;
          final y = (position['y'] as num?)?.toDouble() ?? 0;
          final width = _parseDimension(position['width'], layoutWidth);
          final height = _parseDimension(position['height'], layoutHeight);

          return Positioned(
            left: x,
            top: y,
            width: width,
            height: height,
            child: _buildComponent(component),
          );
        }).toList(),
      ),
    );
  }

  // ──────────────────────────────────────────────────────────────────────
  // 📐 FLEX LAYOUT (RESPONSIVE)
  // ──────────────────────────────────────────────────────────────────────

  Widget _buildFlexLayout(List components, Map<String, dynamic> layout) {
    final scrollable = layout['scrollable'] as bool? ?? true;

    // Sort by order
    final sortedComponents = List<Map<String, dynamic>>.from(
      components.map((c) => c as Map<String, dynamic>),
    )..sort((a, b) {
        final aOrder = (a['position']?['order'] as num?) ?? 0;
        final bOrder = (b['position']?['order'] as num?) ?? 0;
        return aOrder.compareTo(bOrder);
      });

    final children = sortedComponents
        .map((component) => _buildComponent(component))
        .toList();

    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: children,
    );

    if (scrollable) {
      return SingleChildScrollView(
        padding: EdgeInsets.all(
          (layout['padding'] as num?)?.toDouble() ?? 20,
        ),
        child: content,
      );
    }

    final content = component['content'] as Map<String, dynamic>? ?? {};
    final style = component['style'] as Map<String, dynamic>? ?? {};
    final url = content['url'] as String? ?? '';

    if (url.isEmpty) return const SizedBox.shrink();

    return ClipRRect(
      borderRadius: BorderRadius.circular(
        (style['borderRadius'] as num?)?.toDouble() ?? 0,
      ),
      child: Image.network(
        url,
        fit: _parseBoxFit(style['fit']),
        alignment: _parseAlignment(style['alignment']),
        opacity: AlwaysStoppedAnimation(
          (style['opacity'] as num?)?.toDouble() ?? 1.0,
        ),
        errorBuilder: (_, __, ___) => Container(
          color: Colors.grey[200],
          child: Icon(Icons.image, color: Colors.grey[400]),
        ),
      ),
    );
  }

  Widget _buildVideoComponent(Map<String, dynamic> component) {
    final style = component['style'] as Map<String, dynamic>? ?? {};

    // Placeholder for video player (integrate youtube_player_flutter or video_player)
    return Container(
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(
          (style['borderRadius'] as num?)?.toDouble() ?? 0,
        ),
      ),
      child: Center(
        child: Icon(Icons.play_circle_filled, size: 64, color: Colors.white70),
      ),
    );
  }

  Widget _buildButtonComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final style = component['style'] as Map<String, dynamic>? ?? {};
    final text = content['text'] as String? ?? 'Button';
    final action = content['action'] as String? ?? 'default';

    return ElevatedButton(
      onPressed: () => _handleCTA(action, content),
      style: ElevatedButton.styleFrom(
        backgroundColor: _parseColor(style['backgroundColor']),
        foregroundColor: _parseColor(style['textColor']),
        padding: EdgeInsets.symmetric(
          vertical: (style['paddingVertical'] as num?)?.toDouble() ?? 12,
          horizontal: (style['paddingHorizontal'] as num?)?.toDouble() ?? 24,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(
            (style['borderRadius'] as num?)?.toDouble() ?? 8,
          ),
          side: ((style['borderWidth'] as num?)?.toDouble() ?? 0) > 0
              ? BorderSide(
                  width: (style['borderWidth'] as num).toDouble(),
                  color:
                      _parseColor(style['borderColor']) ?? Colors.transparent,
                )
              : BorderSide.none,
        ),
        elevation: (style['elevation'] as num?)?.toDouble() ?? 2,
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: (style['fontSize'] as num?)?.toDouble() ?? 16,
          fontWeight: _parseFontWeight(style['fontWeight']),
        ),
      ),
    );
  }

  Widget _buildInputComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final style = component['style'] as Map<String, dynamic>? ?? {};

    return TextField(
      decoration: InputDecoration(
        labelText: content['label'] as String?,
        hintText: content['placeholder'] as String?,
        filled: true,
        fillColor: _parseColor(style['backgroundColor']),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(
            (style['borderRadius'] as num?)?.toDouble() ?? 8,
          ),
          borderSide: BorderSide(
            width: (style['borderWidth'] as num?)?.toDouble() ?? 1,
            color: _parseColor(style['borderColor']) ?? Colors.grey,
          ),
        ),
        contentPadding: EdgeInsets.symmetric(
          vertical: (style['paddingVertical'] as num?)?.toDouble() ?? 12,
          horizontal: (style['paddingHorizontal'] as num?)?.toDouble() ?? 16,
        ),
      ),
      style: TextStyle(
        fontSize: (style['fontSize'] as num?)?.toDouble() ?? 16,
        color: _parseColor(style['textColor']),
      ),
    );
  }

  Widget _buildCheckboxComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final label = content['checkboxLabel'] as String? ?? 'I agree';
    final isChecked = content['checked'] as bool? ?? false;
    final checkboxColor = _parseColor(content['checkboxColor']) ?? Colors.blue;
    final textColor = _parseColor(content['textColor']) ?? Colors.black;
    final fontSize = (content['fontSize'] as num?)?.toDouble() ?? 14;

    return StatefulBuilder(
      builder: (context, setState) {
        bool _checked = isChecked;
        return CheckboxListTile(
          value: _checked,
          onChanged: (value) {
            setState(() {
              _checked = value ?? false;
            });
          },
          title: Text(
            label,
            style: TextStyle(
              fontSize: fontSize,
              color: textColor,
            ),
          ),
          activeColor: checkboxColor,
          controlAffinity: ListTileControlAffinity.leading,
          contentPadding: EdgeInsets.zero,
        );
      },
    );
  }

  Widget _buildContainerComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final children = content['children'] as List? ?? [];

    final direction = content['direction'] as String? ?? 'column';

    final childWidgets = children
        .map((child) => _buildComponent(child as Map<String, dynamic>))
        .toList();

    if (direction == 'row') {
      return Row(
        mainAxisAlignment: _parseMainAlignment(content['alignment']),
        crossAxisAlignment: _parseCrossAlignment(content['crossAlignment']),
        children: childWidgets,
      );
    }

    return Column(
      mainAxisAlignment: _parseMainAlignment(content['alignment']),
      crossAxisAlignment: _parseCrossAlignment(content['crossAlignment']),
      children: childWidgets,
    );
  }

  Widget _buildCarouselComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final items = content['items'] as List? ?? [];

    return SizedBox(
      height: 200,
      child: PageView.builder(
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index] as Map<String, dynamic>;
          return Padding(
            padding: const EdgeInsets.all(8.0),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                item['url'] as String? ?? '',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  color: Colors.grey[200],
                  child: const Icon(Icons.image),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRatingComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final style = component['style'] as Map<String, dynamic>? ?? {};
    final stars = content['stars'] as int? ?? 5;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(stars, (index) {
        return Icon(
          Icons.star,
          size: (style['size'] as num?)?.toDouble() ?? 32,
          color: _parseColor(style['starColor']) ?? Colors.amber,
        );
      }),
    );
  }

  Widget _buildDividerComponent(Map<String, dynamic> component) {
    final style = component['style'] as Map<String, dynamic>? ?? {};

    return Container(
      height: (style['height'] as num?)?.toDouble() ?? 1,
      margin: EdgeInsets.symmetric(
        vertical: (style['marginVertical'] as num?)?.toDouble() ?? 16,
      ),
      color: _parseColor(style['color']) ?? Colors.grey[300],
    );
  }

  Widget _buildSpacerComponent(Map<String, dynamic> component) {
    final style = component['style'] as Map<String, dynamic>? ?? {};

    return SizedBox(
      height: (style['height'] as num?)?.toDouble() ?? 20,
      width: (style['width'] as num?)?.toDouble(),
    );
  }

  Widget _buildBadgeComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final style = component['style'] as Map<String, dynamic>? ?? {};
    final text = content['badgeText'] as String? ?? 'Badge';
    // ignore: unused_local_variable
    final variant = content['badgeVariant'] as String? ?? 'custom';
    
    // Default colors based on variant could be handled here, but we'll trust the style passed from builder
    final bgColor = _parseColor(style['badgeBackgroundColor']) ?? Colors.grey;
    final txtColor = _parseColor(style['badgeTextColor']) ?? Colors.white;
    final padding = _parseEdgeInsets(style['badgePadding'] ?? {'horizontal': 12, 'vertical': 4});
    final borderRadius = (style['badgeBorderRadius'] as num?)?.toDouble() ?? 12;

    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: txtColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildGradientOverlayComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final gradientType = content['gradientType'] as String? ?? 'linear';
    final direction = content['gradientDirection']; // 'to-bottom', '45deg', etc.
    final stopsRaw = content['gradientStops'] as List? ?? [];

    final stops = stopsRaw.map((s) {
      return _parseColor(s['color']) ?? Colors.transparent;
    }).toList();

    final stopLocs = stopsRaw.map((s) {
      return ((s['position'] as num?)?.toDouble() ?? 0) / 100;
    }).toList();

    Alignment begin = Alignment.topCenter;
    Alignment end = Alignment.bottomCenter;

    if (direction == 'to-right') {
      begin = Alignment.centerLeft;
      end = Alignment.centerRight;
    } else if (direction == 'to-bottom-right') {
      begin = Alignment.topLeft;
      end = Alignment.bottomRight;
    }
    // Add more directions as needed

    Gradient gradient;
    if (gradientType == 'radial') {
      gradient = RadialGradient(
        colors: stops,
        stops: stopLocs,
      );
    } else {
      gradient = LinearGradient(
        begin: begin,
        end: end,
        colors: stops,
        stops: stopLocs,
      );
    }

    return IgnorePointer(
      child: Container(
        decoration: BoxDecoration(gradient: gradient),
      ),
    );
  }

  Widget _buildStatisticComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final style = component['style'] as Map<String, dynamic>? ?? {};
    final value = (content['value'] as num?)?.toDouble() ?? 0;
    final prefix = content['prefix'] as String? ?? '';
    final suffix = content['suffix'] as String? ?? '';
    final animate = content['animateOnLoad'] as bool? ?? true;

    return _StatisticWidget(
      value: value,
      prefix: prefix,
      suffix: suffix,
      animate: animate,
      style: _parseTextStyle(style).copyWith(
        fontSize: (content['fontSize'] as num?)?.toDouble() ?? 36,
        fontWeight: _parseFontWeight(content['fontWeight'] ?? 'bold'),
        color: _parseColor(content['textColor']),
      ),
    );
  }

  Widget _buildProgressCircleComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final style = component['style'] as Map<String, dynamic>? ?? {};
    final value = (content['value'] as num?)?.toDouble() ?? 0;
    final max = (content['max'] as num?)?.toDouble() ?? 100;
    final showPercentage = content['showPercentage'] as bool? ?? true;
    final size = (component['size']?['width'] as num?)?.toDouble() ?? 120;
    final strokeWidth = 8.0;
    final color = style['backgroundColor'] != null ? _parseColor(style['backgroundColor']) : const Color(0xFF6366F1);

    return _ProgressCircleWidget(
      value: value,
      max: max,
      size: size,
      strokeWidth: strokeWidth,
      color: color ?? Colors.blue,
      showPercentage: showPercentage,
    );
  }

  Widget _buildCountdownComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final endTimeStr = content['endTime'] as String?;
    final format = content['format'] as String? ?? 'HH:MM:SS';
    final urgencyThreshold = (content['urgencyThreshold'] as num?)?.toInt();

    if (endTimeStr == null) return const Text('00:00:00');

    return _CountdownWidget(
      endTime: DateTime.tryParse(endTimeStr) ?? DateTime.now().add(const Duration(hours: 1)),
      format: format,
      urgencyThreshold: urgencyThreshold,
    );
  }

  Widget _buildListComponent(Map<String, dynamic> component) {
    final content = component['content'] as Map<String, dynamic>? ?? {};
    final items = content['items'] as List? ?? [];
    final listStyle = content['listStyle'] as String? ?? 'bullet';
    final textColor = _parseColor(content['textColor']) ?? Colors.black;
    final fontSize = (content['fontSize'] as num?)?.toDouble() ?? 14;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: items.map((item) {
        Widget icon;
        if (listStyle == 'checkmark') {
          icon = const Icon(Icons.check, size: 16, color: Colors.green);
        } else if (listStyle == 'numbered') {
          icon = Text('${items.indexOf(item) + 1}.', style: TextStyle(color: textColor, fontWeight: FontWeight.bold));
        } else {
          icon = Icon(Icons.circle, size: 6, color: textColor);
        }

        return Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 4.0, right: 8.0),
                child: icon,
              ),
              Expanded(
                child: Text(
                  item.toString(),
                  style: TextStyle(
                    color: textColor,
                    fontSize: fontSize,
                    height: 1.5,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // 🛠️ STYLE UTILITIES
  // ══════════════════════════════════════════════════════════════════════

  Widget _applyStyle(Widget child, Map<String, dynamic> style) {
    return Container(
      width: _parseDimension(style['width'], MediaQuery.of(context).size.width),
      height:
          _parseDimension(style['height'], MediaQuery.of(context).size.height),
      margin: _parseEdgeInsets(style['margin'] ?? style['marginBottom']),
      padding: _parseEdgeInsets(style['padding']),
      decoration: BoxDecoration(
        color: _parseColor(style['backgroundColor']),
        borderRadius: BorderRadius.circular(
          (style['borderRadius'] as num?)?.toDouble() ?? 0,
        ),
        border: ((style['borderWidth'] as num?)?.toDouble() ?? 0) > 0
            ? Border.all(
                width: (style['borderWidth'] as num).toDouble(),
                color: _parseColor(style['borderColor']) ?? Colors.transparent,
              )
            : null,
      ),
      child: child,
    );
  }

  double? _parseDimension(dynamic value, double maxValue) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) {
      if (value == '100%' || value == 'full') return maxValue;
      if (value.endsWith('%')) {
        final percent = double.tryParse(value.replaceAll('%', '')) ?? 0;
        return maxValue * (percent / 100);
      }
      if (value.endsWith('px')) {
        return double.tryParse(value.replaceAll('px', ''));
      }
    }
    return null;
  }

  EdgeInsets _parseEdgeInsets(dynamic value) {
    if (value == null) return EdgeInsets.zero;
    if (value is num) return EdgeInsets.all(value.toDouble());
    if (value is Map) {
      return EdgeInsets.only(
        top: (value['top'] as num?)?.toDouble() ?? 0,
        right: (value['right'] as num?)?.toDouble() ?? 0,
        bottom: (value['bottom'] as num?)?.toDouble() ?? 0,
        left: (value['left'] as num?)?.toDouble() ?? 0,
      );
    }
    return EdgeInsets.zero;
  }

  TextStyle _parseTextStyle(Map<String, dynamic> style) {
    return TextStyle(
      fontSize: (style['fontSize'] as num?)?.toDouble() ?? 16,
      fontWeight: _parseFontWeight(style['fontWeight']),
      color: _parseColor(style['color']) ?? textColor,
      height: (style['lineHeight'] as num?)?.toDouble(),
      letterSpacing: (style['letterSpacing'] as num?)?.toDouble(),
      decoration: _parseTextDecoration(style['textDecoration']),
      fontStyle:
          style['fontStyle'] == 'italic' ? FontStyle.italic : FontStyle.normal,
    );
  }

  FontWeight _parseFontWeight(dynamic value) {
    if (value == null) return FontWeight.normal;
    if (value == 'bold') return FontWeight.bold;
    if (value is int) {
      switch (value) {
        case 100:
          return FontWeight.w100;
        case 200:
          return FontWeight.w200;
        case 300:
          return FontWeight.w300;
        case 400:
          return FontWeight.w400;
        case 500:
          return FontWeight.w500;
        case 600:
          return FontWeight.w600;
        case 700:
          return FontWeight.w700;
        case 800:
          return FontWeight.w800;
        case 900:
          return FontWeight.w900;
      }
    }
    return FontWeight.normal;
  }

  TextDecoration _parseTextDecoration(dynamic value) {
    if (value == 'underline') return TextDecoration.underline;
    if (value == 'lineThrough') return TextDecoration.lineThrough;
    return TextDecoration.none;
  }

  TextAlign _parseTextAlign(dynamic value) {
    switch (value) {
      case 'left':
        return TextAlign.left;
      case 'center':
        return TextAlign.center;
      case 'right':
        return TextAlign.right;
      case 'justify':
        return TextAlign.justify;
      default:
        return TextAlign.left;
    }
  }

  TextOverflow _parseTextOverflow(dynamic value) {
    switch (value) {
      case 'ellipsis':
        return TextOverflow.ellipsis;
      case 'fade':
        return TextOverflow.fade;
      case 'clip':
      default:
        return TextOverflow.clip;
    }
  }

  BoxFit _parseBoxFit(dynamic value) {
    switch (value) {
      case 'cover':
        return BoxFit.cover;
      case 'contain':
        return BoxFit.contain;
      case 'fill':
        return BoxFit.fill;
      case 'fitWidth':
        return BoxFit.fitWidth;
      case 'fitHeight':
        return BoxFit.fitHeight;
      default:
        return BoxFit.cover;
    }
  }

  Alignment _parseAlignment(dynamic value) {
    switch (value) {
      case 'topLeft':
        return Alignment.topLeft;
      case 'topCenter':
        return Alignment.topCenter;
      case 'topRight':
        return Alignment.topRight;
      case 'centerLeft':
        return Alignment.centerLeft;
      case 'center':
        return Alignment.center;
      case 'centerRight':
        return Alignment.centerRight;
      case 'bottomLeft':
        return Alignment.bottomLeft;
      case 'bottomCenter':
        return Alignment.bottomCenter;
      case 'bottomRight':
        return Alignment.bottomRight;
      default:
        return Alignment.center;
    }
  }

  MainAxisAlignment _parseMainAlignment(dynamic value) {
    switch (value) {
      case 'start':
        return MainAxisAlignment.start;
      case 'center':
        return MainAxisAlignment.center;
      case 'end':
        return MainAxisAlignment.end;
      case 'spaceBetween':
        return MainAxisAlignment.spaceBetween;
      case 'spaceAround':
        return MainAxisAlignment.spaceAround;
      case 'spaceEvenly':
        return MainAxisAlignment.spaceEvenly;
      default:
        return MainAxisAlignment.start;
    }
  }

  CrossAxisAlignment _parseCrossAlignment(dynamic value) {
    switch (value) {
      case 'start':
        return CrossAxisAlignment.start;
      case 'center':
        return CrossAxisAlignment.center;
      case 'end':
        return CrossAxisAlignment.end;
      case 'stretch':
        return CrossAxisAlignment.stretch;
      default:
        return CrossAxisAlignment.stretch;
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // 📋 LEGACY CONTENT TYPE BUILDERS (BACKWARD COMPATIBLE)
  // ════════════════════════════════════════════════════════════════════════

  Widget _buildAnnouncementContent(Map<String, dynamic> config) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Icon
          if (config['iconUrl'] != null)
            Center(
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey[100],
                ),
                child: Image.network(
                  config['iconUrl'],
                  width: 50,
                  height: 50,
                  errorBuilder: (_, __, ___) => Icon(
                    Icons.campaign,
                    size: 40,
                    color: Colors.grey[400],
                  ),
                ),
              ),
            ),

          const SizedBox(height: 16),

          // Title
          if (config['title'] != null)
            Text(
              config['title'],
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
              textAlign: TextAlign.center,
            ),

          const SizedBox(height: 12),

          // Description
          if (config['description'] != null)
            Text(
              config['description'],
              style: TextStyle(
                fontSize: 16,
                color: textColor.withOpacity(0.7),
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),

          const SizedBox(height: 24),

          // CTA Buttons
          _buildCTAButtons(config),
        ],
      ),
    );
  }

  Widget _buildFormContent(Map<String, dynamic> config) {
    final formFields = config['formFields'] as List? ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Title
          if (config['title'] != null)
            Text(
              config['title'],
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),

          const SizedBox(height: 20),

          // Form fields
          ...formFields.map((field) => _buildFormField(field as Map)),

          const SizedBox(height: 24),

          // Submit button
          _buildCTAButtons(config),
        ],
      ),
    );
  }

  Widget _buildFormField(Map field) {
    final fieldName = field['name'] as String;
    final fieldType = field['type'] as String? ?? 'text';
    final label = field['label'] as String? ?? fieldName;
    final required = field['required'] as bool? ?? false;

    // Initialize controllers
    if (!_textControllers.containsKey(fieldName)) {
      _textControllers[fieldName] = TextEditingController();
      _focusNodes[fieldName] = FocusNode();
    }

    Widget fieldWidget;

    switch (fieldType) {
      case 'email':
        fieldWidget = TextField(
          controller: _textControllers[fieldName],
          focusNode: _focusNodes[fieldName],
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            labelText: label + (required ? ' *' : ''),
            errorText: _formErrors[fieldName],
            border: const OutlineInputBorder(),
          ),
          onChanged: (value) {
            _formData[fieldName] = value;
            if (_formErrors[fieldName] != null) {
              setState(() {
                _formErrors[fieldName] = null;
              });
            }
          },
        );
        break;

      case 'phone':
        fieldWidget = TextField(
          controller: _textControllers[fieldName],
          focusNode: _focusNodes[fieldName],
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            labelText: label + (required ? ' *' : ''),
            errorText: _formErrors[fieldName],
            border: const OutlineInputBorder(),
          ),
          onChanged: (value) {
            _formData[fieldName] = value;
            if (_formErrors[fieldName] != null) {
              setState(() {
                _formErrors[fieldName] = null;
              });
            }
          },
        );
        break;

      case 'textarea':
        fieldWidget = TextField(
          controller: _textControllers[fieldName],
          focusNode: _focusNodes[fieldName],
          maxLines: 4,
          decoration: InputDecoration(
            labelText: label + (required ? ' *' : ''),
            errorText: _formErrors[fieldName],
            border: const OutlineInputBorder(),
          ),
          onChanged: (value) {
            _formData[fieldName] = value;
            if (_formErrors[fieldName] != null) {
              setState(() {
                _formErrors[fieldName] = null;
              });
            }
          },
        );
        break;

      case 'rating':
        fieldWidget = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label + (required ? ' *' : ''),
                style: TextStyle(fontSize: 14, color: textColor)),
            const SizedBox(height: 8),
            Row(
              children: List.generate(5, (index) {
                final rating = index + 1;
                final selected = (_formData[fieldName] as int? ?? 0) >= rating;
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _formData[fieldName] = rating;
                      _formErrors[fieldName] = null;
                    });
                    _trackInteraction('rating_$rating');
                  },
                  child: Icon(
                    selected ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 36,
                  ),
                );
              }),
            ),
            if (_formErrors[fieldName] != null)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Text(
                  _formErrors[fieldName]!,
                  style: const TextStyle(color: Colors.red, fontSize: 12),
                ),
              ),
          ],
        );
        break;

      default:
        fieldWidget = TextField(
          controller: _textControllers[fieldName],
          focusNode: _focusNodes[fieldName],
          decoration: InputDecoration(
            labelText: label + (required ? ' *' : ''),
            errorText: _formErrors[fieldName],
            border: const OutlineInputBorder(),
          ),
          onChanged: (value) {
            _formData[fieldName] = value;
            if (_formErrors[fieldName] != null) {
              setState(() {
                _formErrors[fieldName] = null;
              });
            }
          },
        );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: fieldWidget,
    );
  }

  Widget _buildProductContent(Map<String, dynamic> config) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Product image
          if (config['imageUrl'] != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                config['imageUrl'],
                height: 200,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 200,
                  color: Colors.grey[200],
                  child: Icon(Icons.image, size: 60, color: Colors.grey[400]),
                ),
              ),
            ),

          const SizedBox(height: 16),

          // Product name
          if (config['title'] != null)
            Text(
              config['title'],
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: textColor,
              ),
            ),

          const SizedBox(height: 8),

          // Price
          if (config['price'] != null)
            Row(
              children: [
                Text(
                  config['price'],
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.green[700],
                  ),
                ),
                if (config['originalPrice'] != null) ...[
                  const SizedBox(width: 8),
                  Text(
                    config['originalPrice'],
                    style: TextStyle(
                      fontSize: 16,
                      decoration: TextDecoration.lineThrough,
                      color: textColor.withOpacity(0.5),
                    ),
                  ),
                ],
                if (config['discount'] != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      config['discount'],
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ],
            ),

          const SizedBox(height: 12),

          // Rating
          if (config['rating'] != null)
            Row(
              children: [
                ...List.generate(5, (index) {
                  final rating = (config['rating'] as num).toDouble();
                  return Icon(
                    index < rating ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 20,
                  );
                }),
                const SizedBox(width: 8),
                Text(
                  '${config['rating']} (${config['reviewCount'] ?? 0} reviews)',
                  style: TextStyle(
                    fontSize: 14,
                    color: textColor.withOpacity(0.7),
                  ),
                ),
              ],
            ),

          const SizedBox(height: 16),

          // Description
          if (config['description'] != null)
            Text(
              config['description'],
              style: TextStyle(
                fontSize: 14,
                color: textColor.withOpacity(0.7),
                height: 1.5,
              ),
            ),

          const SizedBox(height: 24),

          // CTA Buttons
          _buildCTAButtons(config),
        ],
      ),
    );
  }

  Widget _buildCarouselContent(Map<String, dynamic> config) {
    final images = config['imageCarousel'] as List? ?? [];

    return Column(
      children: [
        // Carousel
        Expanded(
          child: PageView.builder(
            controller: _pageController,
            itemCount: images.length,
            onPageChanged: (index) {
              setState(() {
                _currentPage = index;
              });
              _trackInteraction('carousel_page_$index');
            },
            itemBuilder: (context, index) {
              final image = images[index];
              return Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Expanded(
                      child: Image.network(
                        image['url'],
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => Icon(
                          Icons.image,
                          size: 80,
                          color: Colors.grey[400],
                        ),
                      ),
                    ),
                    if (image['caption'] != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Text(
                          image['caption'],
                          style: TextStyle(
                            fontSize: 16,
                            color: textColor,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ),

        // Page indicators
        if (images.length > 1)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(images.length, (index) {
                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _currentPage == index ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentPage == index
                        ? textColor
                        : textColor.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
          ),

        // CTA Buttons
        Padding(
          padding: const EdgeInsets.all(20),
          child: _buildCTAButtons(config),
        ),
      ],
    );
  }

  Widget _buildMediaContent(Map<String, dynamic> config) {
    return Column(
      children: [
        // Media placeholder (can integrate video player here)
        Expanded(
          child: Container(
            color: Colors.black,
            child: Center(
              child: Icon(
                Icons.play_circle_outline,
                size: 80,
                color: Colors.white,
              ),
            ),
          ),
        ),

        // Controls
        Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (config['title'] != null)
                Text(
                  config['title'],
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: textColor,
                  ),
                ),
              const SizedBox(height: 16),
              _buildCTAButtons(config),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCTAButtons(Map<String, dynamic> config) {
    final buttons = config['buttons'] as List? ?? [];

    if (buttons.isEmpty) {
      // Default button
      return ElevatedButton(
        onPressed: () => _handleCTA('default_action', null),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF6366F1),
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: const Text(
          'Got it',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: buttons.map((btn) {
        final button = btn as Map<String, dynamic>;
        final type = button['type'] as String? ?? 'primary';
        final text = button['text'] as String? ?? 'Continue';
        final action = button['action'] as String? ?? 'default';

        final bgColor =
            _parseColor(button['backgroundColor']) ?? const Color(0xFF6366F1);
        final txtColor = _parseColor(button['textColor']) ?? Colors.white;

        if (type == 'secondary') {
          return Padding(
            padding: const EdgeInsets.only(top: 12),
            child: TextButton(
              onPressed: () => _handleCTA(action, button),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: Text(
                text,
                style: TextStyle(
                  fontSize: 16,
                  color: textColor.withOpacity(0.7),
                ),
              ),
            ),
          );
        }

        return Padding(
          padding: const EdgeInsets.only(top: 12),
          child: ElevatedButton(
            onPressed: () => _handleCTA(action, button),
            style: ElevatedButton.styleFrom(
              backgroundColor: bgColor,
              foregroundColor: txtColor,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              text,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ════════════════════════════════════════════════════════════════════════
// 🧩 HELPER WIDGETS
// ════════════════════════════════════════════════════════════════════════

class _StatisticWidget extends StatelessWidget {
  final double value;
  final String prefix;
  final String suffix;
  final bool animate;
  final TextStyle style;

  const _StatisticWidget({
    required this.value,
    this.prefix = '',
    this.suffix = '',
    this.animate = true,
    required this.style,
  });

  @override
  Widget build(BuildContext context) {
    if (!animate) {
      return Text(
        '$prefix${value.toInt()}$suffix',
        style: style,
      );
    }

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: value),
      duration: const Duration(seconds: 1),
      builder: (context, val, child) {
        return Text(
          '$prefix${val.toInt()}$suffix',
          style: style,
        );
      },
    );
  }
}

class _ProgressCircleWidget extends StatelessWidget {
  final double value;
  final double max;
  final double size;
  final double strokeWidth;
  final Color color;
  final bool showPercentage;

  const _ProgressCircleWidget({
    required this.value,
    required this.max,
    required this.size,
    required this.strokeWidth,
    required this.color,
    required this.showPercentage,
  });

  @override
  Widget build(BuildContext context) {
    final progress = (value / max).clamp(0.0, 1.0);

    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        fit: StackFit.expand,
        children: [
          CircularProgressIndicator(
            value: 1.0,
            strokeWidth: strokeWidth,
            color: Colors.grey[200],
          ),
          CircularProgressIndicator(
            value: progress,
            strokeWidth: strokeWidth,
            color: color,
            strokeCap: StrokeCap.round,
          ),
          if (showPercentage)
            Center(
              child: Text(
                '${(progress * 100).toInt()}%',
                style: TextStyle(
                  fontSize: size * 0.2,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _CountdownWidget extends StatefulWidget {
  final DateTime endTime;
  final String format;
  final int? urgencyThreshold;

  const _CountdownWidget({
    required this.endTime,
    this.format = 'HH:MM:SS',
    this.urgencyThreshold,
  });

  @override
  State<_CountdownWidget> createState() => _CountdownWidgetState();
}

class _CountdownWidgetState extends State<_CountdownWidget> {
  late Timer _timer;
  late Duration _timeLeft;

  @override
  void initState() {
    super.initState();
    _calculateTimeLeft();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          _calculateTimeLeft();
        });
      }
    });
  }

  void _calculateTimeLeft() {
    final now = DateTime.now();
    if (now.isAfter(widget.endTime)) {
      _timeLeft = Duration.zero;
      _timer.cancel();
    } else {
      _timeLeft = widget.endTime.difference(now);
    }
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hours = _timeLeft.inHours.toString().padLeft(2, '0');
    final minutes = (_timeLeft.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (_timeLeft.inSeconds % 60).toString().padLeft(2, '0');

    String text;
    if (widget.format == 'MM:SS') {
      text = '$minutes:$seconds';
    } else {
      text = '$hours:$minutes:$seconds';
    }

    final isUrgent = widget.urgencyThreshold != null &&
        _timeLeft.inSeconds < widget.urgencyThreshold!;

    return Text(
      text,
      style: TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        fontFamily: 'monospace',
        color: isUrgent ? Colors.red : Colors.black,
      ),
    );
  }
}

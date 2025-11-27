import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<void>>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<AsyncValue<void>> {
  AuthNotifier() : super(const AsyncValue.data(null));

  final Dio _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000'));

  Future<void> login(String username, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });
      // Save token logic here
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

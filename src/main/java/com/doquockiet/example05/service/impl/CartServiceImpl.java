package com.doquockiet.example05.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.doquockiet.example05.entity.Cart;
import com.doquockiet.example05.entity.CartItem;
import com.doquockiet.example05.entity.Product;
import com.doquockiet.example05.exceptions.APIException;
import com.doquockiet.example05.exceptions.ResourceNotFoundException;
import com.doquockiet.example05.payloads.CartDTO;
import com.doquockiet.example05.payloads.ProductDTO;
import com.doquockiet.example05.repository.CartItemRepo;
import com.doquockiet.example05.repository.CartRepo;
import com.doquockiet.example05.repository.ProductRepo;
import com.doquockiet.example05.service.CartService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Transactional
@Service
public class CartServiceImpl implements CartService {

	@Autowired
	private CartRepo cartRepo;

	@Autowired
	private ProductRepo productRepo;

	@Autowired
	private CartItemRepo cartItemRepo;

	@Autowired
	private ModelMapper modelMapper;

	private static final Logger logger = LoggerFactory.getLogger(CartServiceImpl.class);

	// Phương thức ánh xạ Cart sang CartDTO
	private CartDTO mapToCartDTO(Cart cart) {
		logger.info("Mapping Cart to CartDTO for cartId: {}", cart.getCartId());
		CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
		List<ProductDTO> products = cart.getCartItems().stream()
				.map(cartItem -> {
					// Ánh xạ thông tin sản phẩm từ Product
					ProductDTO productDTO = modelMapper.map(cartItem.getProduct(), ProductDTO.class);
					// Gán số lượng từ CartItem (bảng cart_items)
					productDTO.setQuantity(cartItem.getQuantity());
					return productDTO;
				})
				.collect(Collectors.toList());
		cartDTO.setProducts(products);
		logger.info("Mapped CartDTO: {}", cartDTO);
		return cartDTO;
	}

	@Override
	public CartDTO addProductToCart(Long cartId, Long productId, Integer quantity) {
		Cart cart = cartRepo.findById(cartId)
				.orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

		Product product = productRepo.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

		// Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
		CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

		if (cartItem != null) {
			return updateProductQuantityInCart(cartId, productId, cartItem.getQuantity() + quantity);
		}

		// Kiểm tra số lượng sản phẩm
        if (product.getQuantity() == 0) {
            throw new APIException(product.getProductName() + " is not available");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }

		// Tạo CartItem mới
		CartItem newCartItem = new CartItem();
		newCartItem.setProduct(product);
		newCartItem.setCart(cart);
		newCartItem.setQuantity(quantity);
		newCartItem.setDiscount(product.getDiscount());
		newCartItem.setProductPrice(product.getSpecialPrice());

		cartItemRepo.save(newCartItem); // Lưu CartItem

		// Cập nhật số lượng sản phẩm trong kho
		product.setQuantity(product.getQuantity() - quantity);

		// Cập nhật tổng giá của giỏ hàng
		cart.setTotalPrice(cart.getTotalPrice() + (product.getSpecialPrice() * quantity));

		// Ánh xạ và trả về CartDTO
		return mapToCartDTO(cart);
	}

	@Override
	public List<CartDTO> getAllCarts() {
		List<Cart> carts = cartRepo.findAll();

		if (carts.size() == 0) {
			throw new APIException("No cart exists");
		}

		// Ánh xạ danh sách Cart sang List<CartDTO>
		List<CartDTO> cartDTOs = carts.stream().map(cart -> mapToCartDTO(cart)).collect(Collectors.toList());
		return cartDTOs;
	}

	@Override
	public CartDTO getCart(String emailId, Long cartId) {
		Cart cart = cartRepo.findByEmailAndCartId(emailId, cartId);

		if (cart == null) {
			throw new ResourceNotFoundException("Cart", "cartId", cartId);
		}

		// Ánh xạ và trả về CartDTO
		return mapToCartDTO(cart);
	}

	@Override
	public CartDTO updateProductQuantityInCart(Long cartId, Long productId, Integer quantity) {
		Cart cart = cartRepo.findById(cartId)
				.orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

		Product product = productRepo.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

		// Tìm CartItem
		CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

		if (cartItem == null) {
			throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");
		}

		// Tính toán tổng số lượng có sẵn (tồn kho + số lượng đã có trong giỏ)
		int totalAvailableStock = product.getQuantity() + cartItem.getQuantity();

		// Kiểm tra xem tổng số lượng có sẵn có đủ cho số lượng mới yêu cầu không
		if (totalAvailableStock < quantity) {
			throw new APIException("Please, make an order of the " + product.getProductName()
					+ " less than or equal to the quantity " + totalAvailableStock + ".");
		}

		// 1. Cập nhật lại tổng giá giỏ hàng (loại bỏ giá cũ của CartItem)
		double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());

		// 2. Cập nhật số lượng sản phẩm trong kho (trả lại số lượng cũ, trừ đi số lượng mới)
		// Số lượng mới trong kho = (Số lượng cũ trong kho + Số lượng cũ trong CartItem) - Số lượng mới yêu cầu
		product.setQuantity(product.getQuantity() + cartItem.getQuantity() - quantity);
		
		// 3. Cập nhật thông tin CartItem
		cartItem.setProductPrice(product.getSpecialPrice());
		cartItem.setQuantity(quantity);
		cartItem.setDiscount(product.getDiscount());

		cartItem = cartItemRepo.save(cartItem);

		// 4. Cập nhật lại tổng giá giỏ hàng (cộng giá mới của CartItem)
		cart.setTotalPrice(cartPrice + (cartItem.getProductPrice() * quantity));
		
		// Ánh xạ và trả về CartDTO
		return mapToCartDTO(cart);
	}

	@Override
	public void updateProductInCarts(Long cartId, Long productId) {
		Cart cart = cartRepo.findById(cartId)
				.orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

		Product product = productRepo.findById(productId)
				.orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
		
		// Tìm CartItem
		CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

		if (cartItem == null) {
			// Không tìm thấy CartItem, không cần làm gì
			return;
		}
		
		// 1. Cập nhật lại tổng giá giỏ hàng (loại bỏ giá cũ của CartItem)
		double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());

		// 2. Cập nhật thông tin CartItem
		cartItem.setProductPrice(product.getSpecialPrice());
		cartItem.setDiscount(product.getDiscount());
		
		cartItem = cartItemRepo.save(cartItem);

		// 3. Cập nhật lại tổng giá giỏ hàng (cộng giá mới của CartItem)
		cart.setTotalPrice(cartPrice + (cartItem.getProductPrice() * cartItem.getQuantity()));
		
		cartRepo.save(cart);
	}
	
	@Override
	public String deleteProductFromCart(Long cartId, Long productId) {
		Cart cart = cartRepo.findById(cartId)
				.orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));

		// Tìm CartItem
		CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);

		if (cartItem == null) {
			throw new ResourceNotFoundException("Product", "productId", productId);
		}

		// 1. Cập nhật lại tổng giá giỏ hàng (trừ giá của CartItem bị xóa)
		cart.setTotalPrice(cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity()));

		// 2. Cập nhật số lượng sản phẩm trong kho (trả lại số lượng đã mua)
		Product product = cartItem.getProduct();
		product.setQuantity(product.getQuantity() + cartItem.getQuantity());

		// 3. Xóa CartItem
		cartItemRepo.deleteCartItemByProductIdAndCartId(cartId, productId);

		return "Product " + cartItem.getProduct().getProductName() + " removed from the cart !!!";
	}

	@Override
	public CartDTO getCartByUser(Long userId) {
		logger.info("Attempting to retrieve cart for userId: {}", userId);
		Cart cart = cartRepo.findByUserUserId(userId)
				.orElseThrow(() -> new ResourceNotFoundException("Cart", "userId", userId));
		logger.info("Cart found for userId {}: {}", userId, cart);
		return mapToCartDTO(cart);
	}
}
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	Heading,
	HStack,
	IconButton,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useColorModeValue,
	useDisclosure,
	useToast,
	VStack,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
} from "@chakra-ui/react";
import { useProductStore } from "../store/product";
import { useState, useRef } from "react";

const ProductCard = ({ product }) => {
	const [updatedProduct, setUpdatedProduct] = useState(product);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isResetting, setIsResetting] = useState(false); 

	const textColor = useColorModeValue("gray.600", "gray.200");
	const bg = useColorModeValue("white", "gray.800");

	const { deleteProduct, updateProduct } = useProductStore();
	const toast = useToast();
	const { isOpen, onOpen, onClose } = useDisclosure();

	const {
		isOpen: isAlertOpen,
		onOpen: onAlertOpen,
		onClose: onAlertClose,
	} = useDisclosure();
	const cancelRef = useRef();

	const handleDeleteProduct = async (pid) => {
		setIsDeleting(true);
		const { success, message } = await deleteProduct(pid);
		setIsDeleting(false);
		onAlertClose();
		toast.closeAll();
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 1900,
				isClosable: false,
			});
		} else {
			toast({
				title: "Success",
				description: message,
				status: "success",
				duration: 1900,
				isClosable: false,
			});
		}
	};

	const handleUpdateProduct = async (pid, updatedProduct) => {
		const hasChanges = (original, updated) => {
			return JSON.stringify(original) !== JSON.stringify(updated);
		};

		toast.closeAll();
		if (
			!updatedProduct.name ||
			!updatedProduct.price ||
			!updatedProduct.image
		) {
			toast({
				title: "Validation Error",
				description: "All fields are required.",
				status: "error",
				duration: 1900,
				isClosable: false,
			});
			return;
		}

		if (!hasChanges(product, updatedProduct)) {
			toast({
				title: "No Changes Detected",
				description: "No updates were made to the product.",
				status: "info",
				duration: 1900,
				isClosable: false,
			});
			onClose();
			return;
		}
		setIsLoading(true);
		const { success, message } = await updateProduct(pid, updatedProduct);
		setIsLoading(false);
		onClose();
		if (!success) {
			toast({
				title: "Error",
				description: message,
				status: "error",
				duration: 1900,
				isClosable: false,
			});
		} else {
			toast({
				title: "Success",
				description: "Product updated successfully",
				status: "success",
				duration: 1900,
				isClosable: false,
			});
		}
	};

	return (
		<Box
			shadow="lg"
			rounded="lg"
			overflow="hidden"
			transition="all 0.3s"
			_hover={{ transform: "translateY(-5px)", shadow: "xl" }}
			bg={bg}
		>
			<Image
				src={product.image}
				alt={product.name}
				h={48}
				w="full"
				objectFit="cover"
			/>

			<Box p={4}>
				<Heading as="h3" size="md" mb={2}>
					{product.name}
				</Heading>

				<Text fontWeight="bold" fontSize="xl" color={textColor} mb={4}>
					${product.price}
				</Text>

				<HStack spacing={2}>
					<IconButton icon={<EditIcon />} onClick={onOpen} colorScheme="blue" />
					<IconButton
						icon={<DeleteIcon />}
						onClick={onAlertOpen}
						colorScheme="red"
					/>
				</HStack>
			</Box>

			{/* Update Product Modal */}
			<Modal isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />

				<ModalContent>
					<ModalHeader>Update Product</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<VStack spacing={4}>
							<Input
								placeholder="Product Name"
								name="name"
								value={updatedProduct.name}
								onChange={(e) =>
									setUpdatedProduct({ ...updatedProduct, name: e.target.value })
								}
							/>
							<Input
								placeholder="Price"
								name="price"
								type="number"
								value={updatedProduct.price}
								onChange={(e) =>
									setUpdatedProduct({
										...updatedProduct,
										price: e.target.value,
									})
								}
							/>
							<Input
								placeholder="Image URL"
								name="image"
								value={updatedProduct.image}
								onChange={(e) =>
									setUpdatedProduct({
										...updatedProduct,
										image: e.target.value,
									})
								}
							/>
						</VStack>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="blue"
							mr={3}
							onClick={() => handleUpdateProduct(product._id, updatedProduct)}
							isLoading={isLoading}
						>
							Update
						</Button>

						<Button
							colorScheme="red"
							mr={3}
							onClick={() => setUpdatedProduct(product)}
							isLoading={isResetting}
						>
							Reset Changes
						</Button>

						<Button variant="ghost" onClick={onClose}>
							Cancel
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={isAlertOpen}
				leastDestructiveRef={cancelRef}
				onClose={onAlertClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold"
							bgGradient="linear(to-r, cyan.400, blue.500)"
							bgClip="text"
						>
							Delete Product
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure you want to delete "{product.name}"? This action
							cannot be undone.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onAlertClose}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => handleDeleteProduct(product._id)}
								isLoading={isDeleting}
								ml={3}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Box>
	);
};

export default ProductCard;
